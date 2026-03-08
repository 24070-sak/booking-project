import os
from langchain_community.document_loaders import Docx2txtLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_classic.chains import create_retrieval_chain

# 1. API Key pour le cerveau
os.environ["GOOGLE_API_KEY"] = "AIzaSyDxMtTLuUZ4PyRE7s1E1mO61XvRKD7aA_w"

print("📚 Reading the Word document...")
# 2. Load your Word document
loader = Docx2txtLoader("vibepi_rules.docx")
docs = loader.load()

# 3. Split the text into smaller chunks
text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
splits = text_splitter.split_documents(docs)

print("🧠 Saving to local ChromaDB memory (Fast & Light)...")
# 4. Save to ChromaDB avec le modèle léger
vectorstore = Chroma.from_documents(
    documents=splits, 
    embedding=FastEmbedEmbeddings(),
    persist_directory="./chroma_db"
)
retriever = vectorstore.as_retriever()

# 5. Set up the strict AI Brain (NOUVEAU MODÈLE ICI 👇)
llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0)

# 6. The Strict Rule Prompt (En Français ! 🇫🇷)
system_prompt = (
    "Tu es l'assistant du support client officiel de Hotely. "
    "Utilise UNIQUEMENT les éléments de contexte suivants pour répondre à la question de l'utilisateur. "
    "Si tu ne connais pas la réponse ou si ce n'est pas dans le contexte, dis : 'Je suis désolé, je n'ai pas cette information, veuillez contacter le support Vibepi.' "
    "N'invente aucune information.\n"
    "RÉPONDS TOUJOURS EN FRANÇAIS, quelle que soit la langue du document d'origine.\n\n"
    "{context}"
)

prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    ("human", "{input}"),
])

# 7. Connect everything together
question_answer_chain = create_stuff_documents_chain(llm, prompt)
rag_chain = create_retrieval_chain(retriever, question_answer_chain)

print("🤖 Bot is ready! Asking a test question...\n")
print("-" * 30)

# 8. Test the Bot!
question = "À quelle heure est l'enregistrement (check-in) ?"
print(f"User: {question}")

response = rag_chain.invoke({"input": question})
print(f"Hotely Bot: {response['answer']}")