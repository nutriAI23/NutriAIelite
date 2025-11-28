
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  User, ChefHat, ScanLine, MessageCircle, 
  Dumbbell, Lightbulb, ChevronRight, Scale, 
  Leaf, Info, AlertCircle, Clock, Check, Loader2,
  Camera, ArrowRight, Save, Moon, Sun
} from 'lucide-react';
import { UserProfile, UserGoal, DailyMealPlan, Meal, DailyTip, ChatMessage, WorkoutAnalysis, FoodAnalysis } from './types';
import * as GeminiService from './services/geminiService';

// --- Components ---

// 1. Welcome Screen
const WelcomeScreen = ({ onStart }: { onStart: () => void }) => (
  <div className="min-h-screen bg-gradient-to-br from-emerald-600 to-teal-800 flex flex-col items-center justify-center p-6 text-white text-center">
    <div className="bg-white/20 p-6 rounded-full mb-8 backdrop-blur-sm animate-pulse">
      <Leaf size={64} className="text-white" />
    </div>
    <h1 className="text-4xl font-bold mb-4 tracking-tight">NutriAI Elite</h1>
    <p className="text-lg opacity-90 mb-10 max-w-xs">
      Sua nutrição e treinos elevados ao próximo nível com Inteligência Artificial.
    </p>
    <button 
      onClick={onStart}
      className="bg-white text-emerald-700 font-bold py-4 px-10 rounded-2xl shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
    >
      Começar Agora <ArrowRight size={20} />
    </button>
  </div>
);

// 2. Profile / Anamnesis Form
const ProfileSetup = ({ onComplete, initialData }: { onComplete: (p: UserProfile) => void, initialData?: UserProfile | null }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Partial<UserProfile>>(initialData || {
    name: '', age: 30, weight: 70, height: 170, 
    gender: 'Outro', goal: UserGoal.HEALTH, 
    mealsPerDay: 3, restrictions: '', preferences: ''
  });

  const next = () => setStep(s => s + 1);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col p-6 transition-colors duration-300">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="mb-8">
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full">
            <div className="h-2 bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${(step/4)*100}%` }}></div>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mt-6">
            {step === 1 && "Qual seu objetivo principal?"}
            {step === 2 && "Dados corporais"}
            {step === 3 && "Restrições e Preferências"}
            {step === 4 && "Rotina Alimentar"}
          </h2>
        </div>

        {step === 1 && (
          <div className="space-y-3">
            {Object.values(UserGoal).map((g) => (
              <button key={g}
                onClick={() => { setProfile({...profile, goal: g}); next(); }}
                className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                  profile.goal === g 
                  ? 'border-emerald-500 bg-emerald-50 text-slate-800' 
                  : 'border-slate-200 dark:border-slate-700 bg-white hover:border-emerald-300 text-slate-700'
                }`}
              >
                <span className="font-semibold">{g}</span>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Gênero</label>
              <select 
                className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-900"
                value={profile.gender}
                onChange={(e) => setProfile({...profile, gender: e.target.value as any})}
              >
                <option>Masculino</option>
                <option>Feminino</option>
                <option>Outro</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Peso (kg)</label>
                <input type="number" className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-900" value={profile.weight} onChange={e => setProfile({...profile, weight: Number(e.target.value)})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Altura (cm)</label>
                <input type="number" className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-900" value={profile.height} onChange={e => setProfile({...profile, height: Number(e.target.value)})} />
              </div>
            </div>
            <button onClick={next} className="w-full bg-emerald-600 text-white p-4 rounded-xl font-bold mt-4 hover:bg-emerald-700 transition-colors">Próximo</button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
             <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Restrições (ex: Glúten, Lactose)</label>
              <input type="text" className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-900" placeholder="Nenhuma" value={profile.restrictions} onChange={e => setProfile({...profile, restrictions: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">O que você mais gosta de comer?</label>
              <textarea className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-900" rows={3} placeholder="Ex: Frango, Batata doce..." value={profile.preferences} onChange={e => setProfile({...profile, preferences: e.target.value})} />
            </div>
            <button onClick={next} className="w-full bg-emerald-600 text-white p-4 rounded-xl font-bold mt-4 hover:bg-emerald-700 transition-colors">Próximo</button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
             <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Refeições por dia</label>
              <div className="grid grid-cols-4 gap-2">
                {[2, 3, 4, 5, 6, 7, 8].map(n => (
                   <button key={n} onClick={() => setProfile({...profile, mealsPerDay: n})} 
                   className={`p-3 rounded-xl font-bold border-2 transition-all ${
                     profile.mealsPerDay === n 
                     ? 'border-emerald-500 bg-emerald-500 text-white' 
                     : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300'
                   }`}>
                     {n}
                   </button>
                ))}
              </div>
            </div>
            <button onClick={() => onComplete(profile as UserProfile)} className="w-full bg-emerald-600 text-white p-4 rounded-xl font-bold mt-8 shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-colors">
              Finalizar Perfil
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// 3. Main Dashboard Components

const MealPlanner = ({ profile, onBack }: { profile: UserProfile, onBack: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [dailyPlan, setDailyPlan] = useState<DailyMealPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [observation, setObservation] = useState('');

  // Constants - Strict Keys
  const KEY_NORMAL = 'plano_normal';
  const KEY_CB = 'plano_custo_beneficio';

  const getToday = () => new Date().toDateString();

  useEffect(() => {
    // Maintenance: Check for expired plans on load (date reset)
    // Also, load the most recent valid plan for today to satisfy "continuar lá"
    const today = getToday();
    
    const loadPlan = (key: string) => {
      const savedStr = localStorage.getItem(key);
      if (savedStr) {
        try {
          const parsed = JSON.parse(savedStr);
          if (parsed.date === today && parsed.plan) {
            return parsed;
          } else {
            // Old date
            localStorage.removeItem(key);
          }
        } catch (e) { localStorage.removeItem(key); }
      }
      return null;
    };

    const pNormal = loadPlan(KEY_NORMAL);
    const pCB = loadPlan(KEY_CB);

    // If both exist (generated today), show the one with later timestamp
    if (pNormal && pCB) {
       setDailyPlan(pNormal.timestamp > pCB.timestamp ? pNormal.plan : pCB.plan);
    } else if (pNormal) {
       setDailyPlan(pNormal.plan);
    } else if (pCB) {
       setDailyPlan(pCB.plan);
    }

  }, []);

  const handleGenerate = async (type: 'Normal' | 'Custo-Benefício') => {
    const key = type === 'Normal' ? KEY_NORMAL : KEY_CB;
    const today = getToday();

    // 1. Check if plan ALREADY exists for today
    const savedStr = localStorage.getItem(key);
    if (savedStr) {
      try {
        const parsed = JSON.parse(savedStr);
        if (parsed.date === today && parsed.plan) {
          // If exists, OPEN it. Do NOT generate new. 1 per day rule.
          setDailyPlan(parsed.plan);
          setError(null);
          return;
        }
      } catch (e) {
        localStorage.removeItem(key);
      }
    }

    // 2. Generate NEW plan (only if not found for today)
    setLoading(true);
    setError(null);

    try {
      // Pass the observation (if any) to the service
      const result = await GeminiService.generateMealPlan(profile, type, observation);
      
      const payload = {
        date: today,
        timestamp: Date.now(),
        plan: result
      };

      try {
        localStorage.setItem(key, JSON.stringify(payload));
      } catch (storageErr) {
        // Quota exceeded: Fallback save without images
        console.warn("Quota exceeded, saving text-only plan");
        const minimalPlan = {
          ...result,
          meals: result.meals.map(m => ({ ...m, imageBase64: undefined }))
        };
        const minimalPayload = {
           date: today,
           timestamp: Date.now(),
           plan: minimalPlan
        };
        try {
           localStorage.setItem(key, JSON.stringify(minimalPayload));
        } catch(e) {
           setError("Memória cheia. O plano foi gerado mas não pôde ser salvo.");
        }
      }
      
      setDailyPlan(result);
    } catch (e: any) {
      setError(e.message || "Erro ao gerar plano.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!dailyPlan) return;
    const { jsPDF } = (window as any).jspdf || { jsPDF: null };
    if (!jsPDF) {
      alert("Erro ao carregar biblioteca de PDF. Tente novamente.");
      return;
    }
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(`Plano Diário - ${dailyPlan.type}`, 10, 20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    
    let yPos = 30;
    
    dailyPlan.meals.forEach((meal, index) => {
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }
        doc.setFont("helvetica", "bold");
        doc.text(`${meal.mealName}: ${meal.recipeName} (${meal.calories}kcal)`, 10, yPos);
        yPos += 7;
        
        doc.setFont("helvetica", "normal");
        doc.text("Ingredientes:", 10, yPos);
        yPos += 7;
        meal.ingredients.forEach(ing => {
            doc.text(`- ${ing}`, 15, yPos);
            yPos += 5;
        });
        
        yPos += 2;
        doc.text("Preparo:", 10, yPos);
        yPos += 5;
        const splitInstructions = doc.splitTextToSize(meal.instructions.join(' '), 180);
        doc.text(splitInstructions, 15, yPos);
        yPos += (splitInstructions.length * 5) + 10;
    });

    doc.save(`Plano_${dailyPlan.type}.pdf`);
  };

  return (
    <div className="p-6 space-y-6 pb-24 bg-gray-100 dark:bg-slate-900 min-h-full transition-colors duration-300">
      <header className="flex items-center gap-2">
         {/* Back Button for both Selection (to Profile) and Details (to Selection) */}
         <button 
           onClick={() => dailyPlan ? setDailyPlan(null) : onBack()}
           className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200"
         >
           <ArrowRight className="rotate-180" size={24} />
         </button>
         <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Plano Alimentar</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Gerado por IA para {profile.goal}</p>
         </div>
      </header>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-2 border border-red-100 dark:border-red-900">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {!dailyPlan && !loading && (
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
              Observações sobre seu progresso (Opcional)
            </label>
            <textarea 
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Ex: Sinto gordura localizada na barriga, estou estagnado, pernas fracas, sem resultados..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors text-sm"
              rows={3}
            />
          </div>

          <button 
            onClick={() => handleGenerate('Normal')}
            className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 rounded-2xl shadow-lg transition-all hover:scale-[1.02]"
          >
            <div className="relative z-10 flex flex-col items-start">
              <span className="bg-white/20 text-xs font-bold px-2 py-1 rounded mb-2">Recomendado</span>
              <span className="text-xl font-bold">Gerar Plano Normal</span>
              <span className="text-emerald-100 text-sm">Balanceado e otimizado para você</span>
            </div>
            <ChefHat className="absolute right-4 bottom-4 text-white/20 w-16 h-16 group-hover:rotate-12 transition-transform" />
          </button>

          <button 
            onClick={() => handleGenerate('Custo-Benefício')}
            className="group relative overflow-hidden bg-gradient-to-r from-orange-400 to-amber-500 text-white p-6 rounded-2xl shadow-lg transition-all hover:scale-[1.02]"
          >
            <div className="relative z-10 flex flex-col items-start">
              <span className="bg-white/20 text-xs font-bold px-2 py-1 rounded mb-2">Econômico</span>
              <span className="text-xl font-bold">Plano Custo-Benefício</span>
              <span className="text-orange-100 text-sm">Barato, acessível e nutritivo</span>
            </div>
            <Scale className="absolute right-4 bottom-4 text-white/20 w-16 h-16 group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
          <Loader2 className="animate-spin mb-4 text-emerald-600" size={48} />
          <p className="font-medium text-slate-600 dark:text-slate-300">Criando {profile.mealsPerDay} refeições personalizadas...</p>
          <p className="text-xs mt-2">Gerando imagens dos pratos...</p>
        </div>
      )}

      {dailyPlan && (
        <div className="space-y-8 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-full">
                <Lightbulb size={20} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm">Resumo do Nutri</h4>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mt-1">{dailyPlan.aiAnalysis}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {dailyPlan.meals.map((meal, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-700">
                    {meal.imageBase64 ? (
                        <img 
                            src={`data:image/jpeg;base64,${meal.imageBase64}`} 
                            alt={meal.recipeName} 
                            className="w-full h-full object-cover" 
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-300 dark:text-slate-500">
                            <ChefHat size={48} />
                        </div>
                    )}
                    <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
                        {meal.mealName}
                    </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">{meal.recipeName}</h3>
                    <div className="text-right shrink-0 ml-2">
                      <span className="block text-xl font-bold text-emerald-600 dark:text-emerald-400">{meal.calories}</span>
                      <span className="text-xs text-slate-400 uppercase">Kcal</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="inline-block bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs px-2 py-1 rounded border border-emerald-100 dark:border-emerald-800">
                        {meal.nutritionalInfo}
                    </span>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-2">Ingredientes</h4>
                    <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                      {meal.ingredients.slice(0, 5).map((ing, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 shrink-0"></span> {ing}
                        </li>
                      ))}
                      {meal.ingredients.length > 5 && <li className="text-xs italic text-slate-400">+ outros...</li>}
                    </ul>
                  </div>

                  <div>
                     <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-2">Preparo Rápido</h4>
                     <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">{meal.instructions.join(' ')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={downloadPDF}
            className="w-full bg-slate-800 dark:bg-slate-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors shadow-lg"
          >
            <Save size={20} /> Baixar PDF Completo
          </button>
        </div>
      )}
    </div>
  );
};

const FoodScanner = ({ profile }: { profile: UserProfile }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<FoodAnalysis | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    setResult(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = (reader.result as string).split(',')[1];
        const data = await GeminiService.analyzeFoodImage(base64, profile);
        setResult(data);
      } catch (err) {
        alert("Erro na análise. Tente novamente.");
      } finally {
        setAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-6 pb-24 h-full flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Scanner Inteligente</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Fotografe rótulos ou pratos</p>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center">
        {!result && !analyzing && (
          <div className="text-center w-full max-w-sm">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-4 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl h-64 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all group bg-white dark:bg-slate-800"
            >
              <div className="bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <Camera size={32} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="font-bold text-slate-600 dark:text-slate-300">Toque para escanear</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Rótulos ou Comida</p>
            </div>
            <input 
              type="file" 
              accept="image/*" 
              capture="environment"
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFile}
            />
          </div>
        )}

        {analyzing && (
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-6">
               <div className="absolute inset-0 border-4 border-slate-200 dark:border-slate-700 rounded-full"></div>
               <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
               <ScanLine className="absolute inset-0 m-auto text-emerald-600 dark:text-emerald-400 animate-pulse" />
            </div>
            <p className="font-bold text-slate-700 dark:text-slate-200 text-lg">Analisando imagem...</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Verificando calorias e nutrientes</p>
          </div>
        )}

        {result && (
          <div className="w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 p-6 animate-fade-in">
            <div className={`text-center p-4 rounded-xl mb-4 ${
              result.verdict === 'Bom' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200' : 
              result.verdict === 'Ruim' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200'
            }`}>
              <span className="block text-xs font-bold uppercase tracking-wider mb-1">Veredito</span>
              <span className="text-3xl font-black">{result.verdict}</span>
            </div>

            {/* Score Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-end mb-1">
                <span className="text-xs font-bold text-slate-500 uppercase">Pontuação</span>
                <span className={`text-lg font-bold ${
                  result.score >= 8 ? 'text-emerald-600 dark:text-emerald-400' : result.score >= 5 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                }`}>{result.score}/10</span>
              </div>
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    result.score >= 8 ? 'bg-emerald-500' : result.score >= 5 ? 'bg-yellow-500' : 'bg-red-500'
                  }`} 
                  style={{ width: `${result.score * 10}%` }}
                ></div>
              </div>
            </div>
            
            <h3 className="font-bold text-slate-800 dark:text-white mb-2">Análise</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6 text-sm">{result.explanation}</p>
            
            {/* Detailed Macros */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl mb-6">
                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 text-center">
                  <span className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Calorias</span>
                  <span className="font-bold text-slate-800 dark:text-white text-sm">{result.calories}</span>
                </div>
                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 text-center">
                  <span className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Carboidratos</span>
                  <span className="font-bold text-slate-800 dark:text-white text-sm">{result.carbs}</span>
                </div>
                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 text-center">
                  <span className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Proteínas</span>
                  <span className="font-bold text-slate-800 dark:text-white text-sm">{result.protein}</span>
                </div>
                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 text-center">
                  <span className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Gorduras</span>
                  <span className="font-bold text-slate-800 dark:text-white text-sm">{result.fat}</span>
                </div>
            </div>
            
            <button onClick={() => setResult(null)} className="w-full py-3 font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 bg-white dark:bg-slate-700 transition-colors">
              Escanear Outro
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ChatSpecialist = ({ profile }: { profile: UserProfile }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: `Olá ${profile.name}! Sou seu especialista em nutrição e treino. Como posso ajudar a atingir seu objetivo de ${profile.goal} hoje?`, timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Format history for Gemini
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      const responseText = await GeminiService.sendChatMessage(history, userMsg.text, profile);
      setMessages(prev => [...prev, { role: 'model', text: responseText || "Desculpe, não entendi.", timestamp: Date.now() }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "Erro de conexão. Tente novamente.", timestamp: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="p-4 bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <User className="text-emerald-600 dark:text-emerald-400" size={20} />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 dark:text-white">Especialista AI</h2>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Online
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl ${
              m.role === 'user' 
              ? 'bg-emerald-600 text-white rounded-br-none' 
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-bl-none shadow-sm'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl rounded-bl-none shadow-sm">
               <div className="flex gap-1">
                 <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                 <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                 <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
               </div>
             </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Pergunte sobre dieta ou treino..."
            className="flex-1 p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 bg-white text-slate-900"
          />
          <button 
            onClick={send}
            disabled={loading || !input.trim()}
            className="bg-emerald-600 text-white p-3 rounded-xl hover:bg-emerald-700 disabled:opacity-50"
          >
            <ArrowRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

const WorkoutBuddy = () => {
  const [exerciseName, setExerciseName] = useState('');
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('12');
  
  const [analysis, setAnalysis] = useState<WorkoutAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const startTimer = (seconds: number) => {
    setTimeLeft(seconds);
    setIsActive(true);
  };

  const analyze = async () => {
    if (!exerciseName) return;
    setLoading(true);
    try {
      const fullWorkout = `${exerciseName} - ${sets} séries de ${reps} repetições`;
      const result = await GeminiService.analyzeWorkout(fullWorkout);
      setAnalysis(result);
    } catch(e) {
      alert("Erro ao analisar treino.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 pb-24 space-y-8 bg-slate-50 dark:bg-slate-900 min-h-full transition-colors duration-300">
      <header>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Treino Inteligente</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Timer e Análise de Exercícios</p>
      </header>

      {/* Timer Section - Sticky/Prominent */}
      <div className="bg-slate-900 dark:bg-slate-800 text-white p-6 rounded-2xl shadow-xl border border-slate-800 dark:border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <span className="font-bold text-emerald-400 uppercase tracking-widest text-xs">Descanso</span>
          <Clock size={20} className="text-slate-400" />
        </div>
        <div className="text-center mb-8">
          <div className="text-6xl font-black font-mono tracking-tighter">
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
          <p className="text-slate-400 text-sm mt-2">{isActive ? 'Descansando...' : 'Pronto para começar'}</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[30, 45, 60, 90, 120].map(s => (
            <button 
              key={s} 
              onClick={() => startTimer(s)}
              className="bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 py-3 rounded-lg font-bold text-sm transition-colors"
            >
              {s}s
            </button>
          ))}
          <button 
            onClick={() => setIsActive(false)}
            className="bg-red-500/20 text-red-400 hover:bg-red-500/30 py-3 rounded-lg font-bold text-sm transition-colors"
          >
            Parar
          </button>
        </div>
      </div>

      {/* Analysis Section */}
      <div className="space-y-4">
        <label className="font-bold text-slate-700 dark:text-slate-300">Qual o exercício de agora?</label>
        
        {/* Changed Input Structure */}
        <input 
          type="text" 
          placeholder="Nome do exercício (ex: Supino Reto)"
          className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-900"
          value={exerciseName}
          onChange={e => setExerciseName(e.target.value)}
        />
        
        <div className="flex gap-2">
            <select
                value={sets}
                onChange={e => setSets(e.target.value)}
                className="flex-1 p-3 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium"
            >
                {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num} Séries</option>
                ))}
            </select>

            <select
                value={reps}
                onChange={e => setReps(e.target.value)}
                className="flex-1 p-3 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium"
            >
                {[6, 8, 10, 12, 15, 20, 'Falha'].map(r => (
                    <option key={r} value={r}>{r} Reps</option>
                ))}
            </select>

            <button 
                onClick={analyze}
                disabled={loading}
                className="bg-emerald-600 text-white px-4 rounded-xl"
            >
                {loading ? <Loader2 className="animate-spin"/> : <Lightbulb />}
            </button>
        </div>

        {analysis && (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 animate-fade-in shadow-sm">
             <div className="flex gap-4 mb-4">
               <div className="flex-1">
                 <span className="text-xs text-slate-400 dark:text-slate-500 uppercase font-bold">Principal</span>
                 <p className="font-bold text-emerald-700 dark:text-emerald-400">{analysis.muscleMain}</p>
               </div>
               <div className="flex-1 border-l pl-4 border-slate-100 dark:border-slate-700">
                 <span className="text-xs text-slate-400 dark:text-slate-500 uppercase font-bold">Secundário</span>
                 <p className="font-bold text-slate-600 dark:text-slate-300">{analysis.muscleSec}</p>
               </div>
             </div>
             <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-100 dark:border-yellow-900 text-sm text-yellow-800 dark:text-yellow-200">
               <span className="font-bold mr-1">Dica AI:</span> {analysis.tip}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DailyTips = () => {
  const [tips, setTips] = useState<DailyTip | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Fixed Key
  const STORAGE_KEY_TIP = 'dica_do_dia';

  // Helper to check 24h validity
  const getValidTip = () => {
    const savedTipStr = localStorage.getItem(STORAGE_KEY_TIP);
    if (savedTipStr) {
      try {
        const savedData = JSON.parse(savedTipStr);
        const elapsed = Date.now() - savedData.timestamp;
        const twentyFourHoursMs = 24 * 60 * 60 * 1000;
        
        if (elapsed < twentyFourHoursMs) {
          return savedData.data;
        }
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  useEffect(() => {
    // Attempt to load existing valid tip on mount
    const validTip = getValidTip();
    if (validTip) {
      setTips(validTip);
    }
  }, []);

  const handleGenerateTip = async () => {
    // Double check validity before generating
    const existing = getValidTip();
    if (existing) {
      setTips(existing);
      return;
    }

    setLoading(true);
    try {
      const data = await GeminiService.getDailyTips();
      
      const payload = {
        timestamp: Date.now(),
        data: data
      };
      localStorage.setItem(STORAGE_KEY_TIP, JSON.stringify(payload));
      setTips(data);
    } catch (e) {
      console.error(e);
      alert("Erro ao gerar dicas.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 pb-24 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-full transition-colors duration-300">
       <header>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Dica do Dia</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Conteúdo fresco para hoje</p>
      </header>

      {!tips && (
        <div className="flex flex-col items-center justify-center py-10">
          <button 
            onClick={handleGenerateTip}
            disabled={loading}
            className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Lightbulb size={24} />}
            {loading ? "Gerando Dicas..." : "Gerar Dica do Dia"}
          </button>
          <p className="text-xs text-slate-400 mt-4 text-center max-w-xs">
            Uma nova dica completa de bem-estar, suco e prato saudável disponível a cada 24 horas.
          </p>
        </div>
      )}
      
      {tips && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-full text-orange-600 dark:text-orange-400"><ChefHat size={20}/></div>
              <h3 className="font-bold text-slate-800 dark:text-white">Prato do Dia</h3>
            </div>
            <h4 className="font-semibold text-emerald-700 dark:text-emerald-400 mb-1">{tips.foodRecipe.title}</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300">{tips.foodRecipe.description}</p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-3">
               <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full text-blue-600 dark:text-blue-400"><Leaf size={20}/></div>
              <h3 className="font-bold text-slate-800 dark:text-white">Drink Funcional</h3>
            </div>
            <h4 className="font-semibold text-emerald-700 dark:text-emerald-400 mb-1">{tips.drinkRecipe.title}</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300">{tips.drinkRecipe.description}</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-5 rounded-2xl shadow-lg text-white">
            <div className="flex items-center gap-3 mb-3">
               <div className="bg-white/20 p-2 rounded-full"><Lightbulb size={20}/></div>
              <h3 className="font-bold">Dica Bônus</h3>
            </div>
            <p className="text-sm opacity-90 leading-relaxed italic">"{tips.wellnessTip}"</p>
          </div>
        </div>
      )}
    </div>
  );
};

// 4. Main App Container
const App = () => {
  const [view, setView] = useState<'welcome' | 'setup' | 'dashboard'>('welcome');
  const [activeTab, setActiveTab] = useState('meal');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  const startSetup = () => setView('setup');
  
  const finishSetup = (p: UserProfile) => {
    setProfile(p);
    setView('dashboard');
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="bg-slate-50 dark:bg-slate-900 min-h-screen relative font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
        
        {/* Theme Toggle - Floating */}
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="fixed top-4 right-4 z-50 p-2 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-emerald-400 transition-all hover:scale-110"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        {/* Content Area */}
        <div className="h-full">
          {view === 'welcome' && <WelcomeScreen onStart={startSetup} />}
          {view === 'setup' && <ProfileSetup onComplete={finishSetup} initialData={profile} />}
          {view === 'dashboard' && (
            <>
              {activeTab === 'meal' && profile && <MealPlanner profile={profile} onBack={startSetup} />}
              {activeTab === 'scan' && profile && <FoodScanner profile={profile} />}
              {activeTab === 'chat' && profile && <ChatSpecialist profile={profile} />}
              {activeTab === 'workout' && <WorkoutBuddy />}
              {activeTab === 'tips' && <DailyTips />}
            </>
          )}
        </div>

        {/* Bottom Navigation */}
        {view === 'dashboard' && (
          <nav className="fixed bottom-0 w-full bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-2 py-3 flex justify-around items-end z-50 shadow-lg-up pb-safe transition-colors duration-300">
            <NavBtn icon={ChefHat} label="Dieta" active={activeTab === 'meal'} onClick={() => setActiveTab('meal')} />
            <NavBtn icon={ScanLine} label="Scanner" active={activeTab === 'scan'} onClick={() => setActiveTab('scan')} />
            
            {/* Special Center Button */}
            <div className="relative -top-6">
              <button 
                 onClick={() => setActiveTab('chat')}
                 className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all ${activeTab === 'chat' ? 'bg-emerald-600 text-white scale-110' : 'bg-slate-800 dark:bg-slate-700 text-emerald-400 hover:scale-105'}`}
              >
                <MessageCircle size={24} />
              </button>
            </div>

            <NavBtn icon={Dumbbell} label="Treino" active={activeTab === 'workout'} onClick={() => setActiveTab('workout')} />
            <NavBtn icon={Lightbulb} label="Dicas" active={activeTab === 'tips'} onClick={() => setActiveTab('tips')} />
          </nav>
        )}
      </div>
    </div>
  );
};

const NavBtn = ({ icon: Icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 w-16 transition-colors ${active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
    <Icon size={24} strokeWidth={active ? 2.5 : 2} />
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

const root = createRoot(document.getElementById('root')!);
root.render(<App />);

export default App;
