import os
from flask import Blueprint, request, jsonify
from langchain_community.document_loaders import Docx2txtLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
from langchain_groq import ChatGroq
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_classic.chains import create_retrieval_chain

from app.models.hotel import Hotel
from app.models.room import Room

chatbot_bp = Blueprint('chatbot', __name__)

# We use a global variable so the AI loads only once
qa_chain = None

def get_chatbot_chain():
    global qa_chain
    if qa_chain is not None:
        return qa_chain
        
    # 1. Load the Word document
    
    loader = Docx2txtLoader("vibepi_rules.docx")
    docs = loader.load()
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    splits = text_splitter.split_documents(docs)

    # 2. Setup Vector Database
    vectorstore = Chroma.from_documents(
        documents=splits, 
        embedding=FastEmbedEmbeddings(),
        persist_directory="./chroma_db"
    )
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

    # 3. Setup LLM
    llm = ChatGroq(model="llama-3.1-8b-instant", temperature=0)

    system_prompt = (
        "Tu es l'assistant du support client officiel de Hotely. "
        "Utilise UNIQUEMENT le contexte suivant pour répondre à l'utilisateur. "
        "Si l'information est absente du document, réponds exactement ceci : "
        "'Je suis désolé, je n'ai pas cette information dans mes fichiers. "
        "Veuillez contacter notre support aux adresses suivantes : 24070@supnum.mr ou 24041@supnum.mr'\n"
        "RÉPONDS TOUJOURS EN FRANÇAIS.\n\n"
        "{context}"
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{input}"),
    ])

    qa_chain = create_retrieval_chain(retriever, create_stuff_documents_chain(llm, prompt))
    return qa_chain

@chatbot_bp.route('/api/chat', methods=['POST'])
def chat():
    # Receive JSON data from React
    data = request.get_json()
    
    if not data or 'input' not in data:
        return jsonify({"error": "Veuillez envoyer une question dans le champ 'input'."}), 400
        
    user_input = data['input']
    query_lower = user_input.lower().strip()
    
    # --- 1. Requêtes: "moins cher", "meilleure offre" ---
    if "moins cher" in query_lower or "meilleure" in query_lower or "offre" in query_lower:
        # Trouver les chambres les moins chères disponibles
        cheapest_rooms = Room.query.filter_by(is_available=True).order_by(Room.price_per_night.asc()).limit(10).all()
        hotels_dict = {}
        for r in cheapest_rooms:
            if r.hotel and r.hotel.id not in hotels_dict:
                hotels_dict[r.hotel.id] = r.hotel
            if len(hotels_dict) >= 4:
                break
                
        hotels_data = [h.to_dict() for h in hotels_dict.values()]
        
        # Secours, récupérer tous et trier par la propriété to_dict()['lowest_price']
        if not hotels_data:
            all_hotels = Hotel.query.all()
            hotels_with_price = [h.to_dict() for h in all_hotels if h.to_dict().get('lowest_price') is not None]
            hotels_with_price.sort(key=lambda x: x['lowest_price'])
            hotels_data = hotels_with_price[:4]
            
        return jsonify({
            "answer": "Voici une sélection de nos hôtels et offres les moins chers actuellement disponibles sur Hotely :",
            "hotels": hotels_data
        }), 200

    # --- 2. Requêtes: "chambres disponibles" ---
    elif "chambre" in query_lower and "disponible" in query_lower:
        rooms = Room.query.filter_by(is_available=True).limit(5).all()
        rooms_data = []
        for r in rooms:
            r_dict = r.to_dict()
            if r.hotel:
                r_dict['hotel_name'] = r.hotel.name
                r_dict['hotel_location'] = r.hotel.location
            rooms_data.append(r_dict)
            
        return jsonify({
            "answer": "Voici quelques excellentes chambres actuellement disponibles pour votre séjour :",
            "rooms": rooms_data
        }), 200

    # --- 3. Requêtes: "nouakchott" ---
    elif "nouakchott" in query_lower:
        hotels = Hotel.query.filter(Hotel.location.ilike('%Nouakchott%')).limit(4).all()
        hotels_data = [h.to_dict() for h in hotels]
        return jsonify({
            "answer": "Voici une excellente liste d'hôtels et d'hébergements situés à Nouakchott :",
            "hotels": hotels_data
        }), 200
        
    # --- 4. Requêtes: "photos" ---
    elif "photo" in query_lower or "image" in query_lower:
        # Hôtels avec une image
        hotels = Hotel.query.filter(Hotel.image_url.isnot(None)).filter(Hotel.image_url != '').limit(4).all()
        hotels_data = [h.to_dict() for h in hotels]
        return jsonify({
            "answer": "Bien sûr, voici quelques photos de nos superbes établissements pour vous donner des idées :",
            "hotels": hotels_data
        }), 200
    
    try:
        # Pour le reste, on passe à l'IA LangChain
        chain = get_chatbot_chain()
        response = chain.invoke({"input": user_input})
        
        # Return the answer to React
        return jsonify({"answer": response["answer"]}), 200
        
    except Exception as e:
        print(f"Chatbot Error: {e}")
        return jsonify({"answer": "Désolé, je rencontre un problème technique. Veuillez réessayer."}), 500