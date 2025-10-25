
import { GoogleGenAI } from "@google/genai";
import { Code } from '../types';

const prompts = {
  es: (code: Code) => `Explica el origen o la lógica para descifrar el siguiente código juvenil: "${code.code}".

El significado conocido es: "${code.meaning}".

Por ejemplo, si es un acrónimo (como 'BRB' por 'Be Right Back') o si los números representan el conteo de letras (como '143' por 'I Love You').

Tu explicación debe ser breve, clara y centrarse únicamente en CÓMO el código representa el significado. No agregues consejos para padres ni información de contexto adicional.

Responde en español.`,

  en: (code: Code) => `Explain the origin or logic for deciphering the following teen slang code: "${code.code}".

The known meaning is: "${code.meaning}".

For example, if it's an acronym (like 'BRB' for 'Be Right Back') or if the numbers represent letter counts (like '143' for 'I Love You').

Your explanation should be brief, clear, and focus solely on HOW the code represents the meaning. Do not add parental advice or extra context.

Respond in English.`,

  ka: (code: Code) => `ახსენი შემდეგი თინეიჯერული სლენგის კოდის წარმოშობა ან ლოგიკა: "${code.code}".

ცნობილი მნიშვნელობაა: "${code.meaning}".

მაგალითად, თუ ეს არის აკრონიმი (როგორიცაა 'BRB' - 'Be Right Back') ან თუ რიცხვები წარმოადგენს ასოების რაოდენობას (როგორიცაა '143' - 'I Love You').

შენი ახსნა უნდა იყოს მოკლე, გასაგები და ფოკუსირებული მხოლოდ იმაზე, თუ როგორ წარმოადგენს კოდი მის მნიშვნელობას. არ დაამატო რჩევები მშობლებისთვის ან დამატებითი კონტექსტი.

მიპასუხე ქართულად.`
};

const getExplanation = async (code: Code, lang: 'es' | 'en' | 'ka'): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = prompts[lang](code);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Error fetching explanation from Gemini API:", error);
    let errorMessage = "Could not get a detailed explanation at this time. Please try again later.";
    if (lang === 'es') {
      errorMessage = "No se pudo obtener una explicación detallada en este momento. Por favor, inténtelo de nuevo más tarde.";
    } else if (lang === 'ka') {
      errorMessage = "ამჟამად დეტალური ახსნა-განმარტების მიღება ვერ ხერხდება. გთხოვთ, სცადოთ მოგვიანებით.";
    }
    return errorMessage;
  }
};

export default getExplanation;