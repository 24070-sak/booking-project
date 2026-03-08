import os
from fastapi import FastAPI
from pydantic import BaseModel
from langchain_community.document_loaders import Docx2txtLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
from langchain_groq import ChatGroq
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_classic.chains import create_retrieval_chain

# 1. Ta clé Groq
os.environ["GROQ_API_KEY"] = "xxxxxxxxxxxxxx"

app = FastAPI()

# 2. Préparation de la base de données (exécuté au démarrage)
loader = Docx2txtLoader("vibepi_rules.docx")
docs = loader.load()
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
splits = text_splitter.split_documents(docs)

vectorstore = Chroma.from_documents(
    documents=splits, 
    embedding=FastEmbedEmbeddings(),
    persist_directory="./chroma_db"
)
retriever = vectorstore.as_retriever(search_kwargs={"k": 3}) # Lit 3 morceaux au lieu d'un seul

# 3. Le Cerveau IA
llm = ChatGroq(model="llama-3.1-8b-instant", temperature=0)

system_prompt = (
    "Tu es l'assistant du support client officiel de Vibepi. "
    "Utilise UNIQUEMENT le contexte suivant pour répondre à l'utilisateur. "
    "Si l'information est absente du document, réponds exactement ceci : "
    "'Je suis désolé, je n'ai pas cette information dans mes fichiers. "
    "Veuillez contacter notre support aux adresses suivantes : sak technicien ou 24041@supnum.mr'\n"
    "RÉPONDS TOUJOURS EN FRANÇAIS.\n\n"
    "{context}"
)

prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    ("human", "{input}"),
])

chain = create_retrieval_chain(retriever, create_stuff_documents_chain(llm, prompt))
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Ajoute ce bloc pour autoriser React (qui tourne sur le port 3000 ou 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # On autorise tout pour le développement
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class Question(BaseModel):
    input: str

@app.post("/chat")
def chat(request: Question):
    response = chain.invoke({"input": request.input})
    return {"answer": response["answer"]}