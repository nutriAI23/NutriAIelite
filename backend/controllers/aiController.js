const { GoogleGenAI } = require("@google/genai");
const { MealPlan, DailyTip, Scanner } = require('../models/Schemas');

// Initialize Gemini
// Ensure API_KEY is set in backend/.env or your server environment variables
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_TEXT = "gemini-2.5-flash";
const MODEL_IMAGE = "gemini-2.5-flash-image";

// Helper: Get today's date string YYYY-MM-DD
const getTodayDate = () => new Date().toISOString().split('T')[0];

exports.getMealPlan = async (req, res) => {
    try {
        const { profile, observation } = req.body;
        const type = req.params.type === 'normal' ? 'Normal' : 'Custo-Benefício';
        // For this demo, using a generic userId. In production, get from Auth middleware.
        const userId = req.headers['user-id'] || 'default_user'; 
        const today = getTodayDate();

        // 1. Check Database
        let existing = await MealPlan.findOne({ userId, date: today, type });
        if (existing) {
            return res.json(existing.planData);
        }

        // 2. Generate with Gemini
        // Logic for "Adjustment based on Observation"
        let adaptationInstruction = "";
        const obsLower = (observation || "").toLowerCase();
        
        if (obsLower.includes("estagnado") || obsLower.includes("sem resultados")) {
            adaptationInstruction = "URGENTE: Usuário relatou estagnação. Aplicar estratégia de Choque Metabólico (Ciclo de Carboidratos) para quebrar homeostase.";
        } else if (obsLower.includes("gordura") || obsLower.includes("barriga")) {
            adaptationInstruction = "FOCO: Gordura localizada. Priorizar alimentos anti-inflamatórios e baixo índice glicêmico.";
        } else if (obsLower.includes("fraco") || obsLower.includes("braços finos")) {
            adaptationInstruction = "FOCO: Hipertrofia. Aumentar aporte proteico e carboidratos complexos pré-treino.";
        }

        const prompt = `
            Gere um plano alimentar "${type}" para hoje.
            Refeições: ${profile.mealsPerDay}.
            Perfil: ${profile.goal}, ${profile.weight}kg.
            
            RELATO DO USUÁRIO: "${observation}"
            ${adaptationInstruction}

            ${type === 'Custo-Benefício' ? 'Priorize alimentos baratos e acessíveis.' : 'Priorize qualidade nutricional.'}
            
            Retorne JSON estrito: { aiAnalysis: string, meals: [{ mealName, recipeName, calories, instructions:[], ingredients:[], nutritionalInfo }] }
        `;

        const response = await ai.models.generateContent({
            model: MODEL_TEXT,
            contents: prompt,
            config: { 
                responseMimeType: "application/json",
                responseSchema: {
                     type: "OBJECT",
                     properties: {
                         aiAnalysis: {type: "STRING"},
                         meals: { type: "ARRAY", items: { type: "OBJECT", properties: {
                             mealName: {type: "STRING"}, recipeName: {type: "STRING"}, calories: {type: "NUMBER"},
                             instructions: {type: "ARRAY", items: {type: "STRING"}},
                             ingredients: {type: "ARRAY", items: {type: "STRING"}},
                             nutritionalInfo: {type: "STRING"}
                         }}}
                     }
                }
            }
        });

        const planData = JSON.parse(response.text);
        planData.type = type;

        // 3. Save to DB
        await MealPlan.create({ userId, date: today, type, planData, observation });

        res.json(planData);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao gerar plano" });
    }
};

exports.getDailyTip = async (req, res) => {
    try {
        const today = getTodayDate();
        
        // 1. Check DB (Global Tip for everyone, or per user)
        let existing = await DailyTip.findOne({ date: today });
        if (existing) {
            return res.json(existing.content);
        }

        // 2. Generate
        const response = await ai.models.generateContent({
            model: MODEL_TEXT,
            contents: "Gere: 1 receita de prato saudável, 1 suco funcional, 1 dica de bem-estar. JSON: { foodRecipe: {title, description}, drinkRecipe: {title, description}, wellnessTip: string }",
            config: { responseMimeType: "application/json" }
        });

        const content = JSON.parse(response.text);

        // 3. Save
        await DailyTip.create({ date: today, content });
        
        res.json(content);
    } catch (error) {
        res.status(500).json({ error: "Erro ao gerar dica" });
    }
};

exports.analyzeWorkout = async (req, res) => {
    try {
        const { workout } = req.body;
        const response = await ai.models.generateContent({
            model: MODEL_TEXT,
            contents: `Analise o treino: "${workout}". Identifique: muscleMain, muscleSec, e dê uma dica técnica (tip). Retorne JSON.`,
            config: { responseMimeType: "application/json" }
        });
        res.json(JSON.parse(response.text));
    } catch (error) {
        res.status(500).json({ error: "Erro na análise" });
    }
};

exports.analyzeScanner = async (req, res) => {
    try {
        const { image, profile } = req.body;
        const prompt = `Analise a imagem de comida/rótulo. Objetivo: ${profile.goal}. Retorne JSON: verdict (Bom/Neutro/Ruim), score (0-10), explanation, calories, carbs, protein, fat.`;
        
        const response = await ai.models.generateContent({
            model: MODEL_TEXT, // Flash 2.5 supports images in generateContent
            contents: {
                parts: [
                    { inlineData: { mimeType: "image/jpeg", data: image } },
                    { text: prompt }
                ]
            },
            config: { responseMimeType: "application/json" }
        });

        const data = JSON.parse(response.text);
        
        // Save history (Async, don't await to speed up response)
        Scanner.create({ 
            userId: req.headers['user-id'] || 'anon', 
            verdict: data.verdict, 
            score: data.score, 
            data: data 
        });

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Erro no scanner" });
    }
};