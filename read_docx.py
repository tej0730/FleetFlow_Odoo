import sys
from zipfile import ZipFile
import xml.etree.ElementTree as ET

def read_docx(path):
    word_schema = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
    
    with ZipFile(path) as docx:
        xml_content = docx.read('word/document.xml')
        
    tree = ET.XML(xml_content)
    paragraphs = []
    
    for paragraph in tree.iter(word_schema + 'p'):
        texts = [node.text for node in paragraph.iter(word_schema + 't') if node.text]
        if texts:
            paragraphs.append("".join(texts))
            
    return "\n".join(paragraphs)

if __name__ == "__main__":
    content = read_docx(sys.argv[1])
    with open("plan.txt", "w", encoding="utf-8") as f:
        f.write(content)
