import os
from langchain_community.document_loaders import Docx2txtLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
from langchain_groq import ChatGroq  # 👈 NOUVEAU : On importe Groq
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_classic.chains import create_retrieval_chain

# 1. API Key Groq (Plus besoin de VPN en Mauritanie !)
os.environ["GROQ_API_KEY"] = "xxxxxxxxxxxxxx"

print("📚 Lecture du document Word...")
# 2. Charger le document Word
loader = Docx2txtLoader("vibepi_rules.docx")
docs = loader.load()

# 3. Découper le texte
text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
splits = text_splitter.split_documents(docs)

print("🧠 Sauvegarde dans la mémoire locale ChromaDB...")
# 4. Sauvegarder dans ChromaDB
vectorstore = Chroma.from_documents(
    documents=splits, 
    embedding=FastEmbedEmbeddings(),
    persist_directory="./chroma_db"
)
retriever = vectorstore.as_retriever()

# 5. Configurer le NOUVEAU Cerveau IA (LLaMA 3 ultra-rapide) 👇
llm = ChatGroq(model="llama-3.1-8b-instant", temperature=0)

# 6. Le Prompt strict
system_prompt = (
    "Tu es l'assistant du support client officiel de Vibepi. "
    "Utilise UNIQUEMENT les éléments de contexte suivants pour répondre à la question de l'utilisateur. "
    "Si tu ne trouves pas la réponse exacte dans le document, ne l'invente pas. "
    "À la place, réponds exactement ceci : 'Je suis désolé, je n'ai pas cette information dans mes fichiers. "
    "Veuillez contacter le support à l'adresse suivante : 24070@supnum.mr'\n"
    "RÉPONDS TOUJOURS EN FRANÇAIS.\n\n"
    "{context}"
)

prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    ("human", "{input}"),
])

# 7. Connecter le tout
question_answer_chain = create_stuff_documents_chain(llm, prompt)
rag_chain = create_retrieval_chain(retriever, question_answer_chain)

print("🤖 Le Bot est prêt ! Lancement de la question test...\n")
print("-" * 30)

# 8. Tester le Bot !
question = "À quelle heure est l'enregistrement (check-in) ?"
print(f"User: {question}")

response = rag_chain.invoke({"input": question})
print(f"Vibepi Bot: {response['answer']}")