import os
from fastapi import FastAPI
from pydantic import BaseModel
from langchain_community.document_loaders import Docx2txtLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
from langchain_groq import ChatGroq  # 👈 NOUVEAU : On importe Groq
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_classic.chains import create_retrieval_chain

# 1. API Key Groq (Plus de blocage, plus de VPN !)
os.environ["GROQ_API_KEY"] = "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"

# 2. Initialiser l'application Web
app = FastAPI(title="Vibepi AI Bot API")

print("⏳ Démarrage du serveur et chargement de la mémoire...")

# 3. Préparer la mémoire
loader = Docx2txtLoader("vibepi_rules.docx")
docs = loader.load()
text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
splits = text_splitter.split_documents(docs)

vectorstore = Chroma.from_documents(
    documents=splits, 
    embedding=FastEmbedEmbeddings(),
    persist_directory="./chroma_db"
)
retriever = vectorstore.as_retriever()

# 4. Préparer le NOUVEAU Cerveau IA (LLaMA 3 via Groq) 👇
llm = ChatGroq(model="llama3-8b-8192", temperature=0)

system_prompt = (
    "Tu es l'assistant du support client officiel de Vibepi. "
    "Utilise UNIQUEMENT les éléments de contexte suivants pour répondre à la question de l'utilisateur. "
    "Si tu ne connais pas la réponse, dis : 'Je suis désolé, je n'ai pas cette information, veuillez contacter le support Vibepi.' "
    "N'invente aucune information.\n"
    "RÉPONDS TOUJOURS EN FRANÇAIS.\n\n"
    "{context}"
)

prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    ("human", "{input}"),
])

question_answer_chain = create_stuff_documents_chain(llm, prompt)
rag_chain = create_retrieval_chain(retriever, question_answer_chain)

print("✅ Serveur prêt et connecté à Groq !")

# 5. Créer le format de la question attendue
class UserRequest(BaseModel):
    question: str

# 6. Créer la "Porte d'entrée" (Endpoint) de l'API
@app.post("/chat")
def chat_with_bot(request: UserRequest):
    response = rag_chain.invoke({"input": request.question})
    return {"bot_response": response['answer']}