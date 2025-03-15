'use client';

import React from 'react';
import { Search, Edit, Camera, Star, Grid, List, Shield, Plus, X, Heart, Trash2, Download, Upload, Map, Calendar, Check, ChevronDown, Move, ZoomIn, ZoomOut, RotateCcw, Minus, Package, ChevronRight, User } from 'lucide-react';

// Définir un type TypeScript pour Profil
interface Profil {
  id: number;
  name: string;
  nameJp: string;
  type: string;
  rarity: string;
  power: number;
  height: string;
  weight: string;
  city: string;
  favorite: boolean;
  abilities: string[];
  stats: { [key: string]: number };
  description: string;
  customImage: boolean;
  imageData?: string;
  score: number;
  tags: string[];
  meetingDate: string;
}

// Interface pour les données d'image
interface ImageEditorData {
  originalSrc: string;
  position: { x: number, y: number };
  x: number;
  y: number;
  zoomFactor: number;
  type?: 'gif' | 'image'; // Ajout du type optionnel pour supporter les GIFs
}

// Fonction utilitaire pour vérifier si une chaîne est un JSON d'image
const isJsonImage = (data: string): boolean => {
  try {
    if (!data || typeof data !== 'string') return false;
    
    // Vérifier que c'est un JSON bien formé
    if (!data.startsWith('{')) return false;
    
    // Essayer de parser le JSON
    const parsed = JSON.parse(data);
    
    // Vérification plus robuste de la structure
    // Soit c'est un GIF (avec type === 'gif')
    // Soit c'est une image transformée (avec position et zoomFactor)
    return parsed && 
           typeof parsed === 'object' && 
           (
             // Case 1: GIF image
             (parsed.type === 'gif' && 
              typeof parsed.originalSrc === 'string' &&
              parsed.originalSrc.length > 0) ||
             // Case 2: Transformed regular image
             (typeof parsed.originalSrc === 'string' &&
              parsed.originalSrc.length > 0 &&
              parsed.position && 
              typeof parsed.position.x === 'number' &&
              typeof parsed.position.y === 'number' &&
              typeof parsed.zoomFactor === 'number')
           );
  } catch (e) {
    console.error("Erreur dans isJsonImage:", e);
    return false;
  }
};

// Fonction utilitaire pour extraire les données GIF
const getGifData = (data: string) => {
  try {
    if (!data || typeof data !== 'string') return null;
    
    // Vérifier d'abord si c'est un JSON bien formé
    if (data.startsWith('{') && data.endsWith('}')) {
      const parsed = JSON.parse(data);
      // Vérifier que les données ont la structure attendue
      if (parsed && parsed.originalSrc && parsed.type === 'gif') {
        return parsed;
      }
    }
    return null;
  } catch (e) {
    console.error("Erreur d'analyse JSON:", e);
    return null;
  }
};

// Image de secours pour les erreurs de chargement
const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSIxNTAiIGN5PSIxNTAiIHI9IjE1MCIgZmlsbD0iI2YwZjBmMCIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSI4MCIgZmlsbD0iIzk5OTk5OSI+PzwvdGV4dD4KPC9zdmc+';

// Gestionnaire d'erreur pour les images
const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  console.log("Erreur de chargement d'image détectée. Utilisation de l'image de secours.");
  if (e && e.currentTarget) {
    // Définir l'image de secours
    e.currentTarget.src = FALLBACK_IMAGE;
    // Ajouter une classe pour indiquer visuellement l'erreur
    e.currentTarget.classList.add('image-error');
  }
};

const RoisDeLaBZ = () => {
  const [viewMode, setViewMode] = React.useState('grid');
  const [activeTab, setActiveTab] = React.useState('home');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedProfil, setSelectedProfil] = React.useState<Profil | null>(null);
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [showExportModal, setShowExportModal] = React.useState(false);
  const [showImportModal, setShowImportModal] = React.useState(false);
  const [editingField, setEditingField] = React.useState<string | null>(null);
  
  // États pour l'éditeur d'image
  const [isEditingImage, setIsEditingImage] = React.useState(false);
  const [imageToEdit, setImageToEdit] = React.useState<string | null>(null);
  const [profileIdToEdit, setProfileIdToEdit] = React.useState<number | null>(null);
  const [imagePosition, setImagePosition] = React.useState({ x: 0, y: 0 });
  const [zoomFactor, setZoomFactor] = React.useState(1);
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  
  // Liste des villes de France (utilisée comme attributs/traits)
  const frenchCities = [
    "Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", 
    "Strasbourg", "Montpellier", "Bordeaux", "Lille", "Rennes", 
    "Reims", "Saint-Étienne", "Toulon", "Le Havre", "Grenoble", 
    "Dijon", "Angers", "Nîmes", "Clermont-Ferrand", "Tours", "Annecy"
  ];
  
  // Options pour les caractéristiques
  const personalityTypes = [
    "Créative", "Aventurière", "Intellectuelle", "Séductrice", "Spontanée", "Mystérieuse",
    "Passionnée", "Déterminée", "Artistique", "Sportive", "Introvertie", "Extravertie",
    "Pragmatique", "Sensible", "Indépendante", "Ambitieuse", "Charismatique", "Réservée"
  ];
  
  const lifestyleOptions = ["Indépendante", "Sociable", "Casanière", "Festive", "Voyageuse", "Équilibrée", "Workaholic", "Bohème", "Alternative", "Classique", "Luxe", "Minimaliste"];
  
  const silhouetteOptions = ["Athlétique", "Fine", "Moyenne", "Pulpeuse", "Voluptueuse", "Élancée", "Tonique", "Formée", "Entraînée", "Mannequin"];
  
  const heightOptions = [
    "150 cm", "155 cm", "160 cm", "165 cm", "170 cm", "175 cm", "180 cm", "185 cm", "190 cm", "195 cm"
  ];
  
  const weightOptions = [
    "1 kg", "2 kg", "5 kg", "10 kg", "15 kg", "20 kg", "25 kg", "30 kg", "40 kg", "50 kg",
    "55 kg", "60 kg", "65 kg", "70 kg", "75 kg", "80 kg", "85 kg", "90 kg", "95 kg", "100 kg", "150 kg", "200 kg", "300 kg"
  ];
  
  const customTags = [
    // Rencontres
    { category: "Rencontre", tag: "Soirée" },
    { category: "Rencontre", tag: "Vacances" },
    { category: "Rencontre", tag: "Travail" },
    { category: "Rencontre", tag: "Bar" },
    { category: "Rencontre", tag: "Club" },
    { category: "Rencontre", tag: "Festival" },
    { category: "Rencontre", tag: "Premier RDV" },
    { category: "Rencontre", tag: "Ami(e) commun(e)" },
    { category: "Rencontre", tag: "Boîte" },
    { category: "Rencontre", tag: "VIP" },
    { category: "Rencontre", tag: "Étranger" },
    { category: "Rencontre", tag: "Plage" },
    { category: "Rencontre", tag: "Concert" },
    
    // Apps
    { category: "App", tag: "Tinder" },
    { category: "App", tag: "Bumble" },
    { category: "App", tag: "Hinge" },
    { category: "App", tag: "Happn" },
    { category: "App", tag: "Fruitz" },
    { category: "App", tag: "Grindr" },
    { category: "App", tag: "OkCupid" },
    
    // Relations
    { category: "Relation", tag: "Coup d'un soir" },
    { category: "Relation", tag: "Relation" },
    { category: "Relation", tag: "Ex" },
    { category: "Relation", tag: "Plan cul régulier" },
    { category: "Relation", tag: "Amis avec bénéfices" },
    
    // Activités
    { category: "Intime", tag: "Fellation" },
    { category: "Intime", tag: "Sodomie" },
    { category: "Intime", tag: "BDSM" },
    { category: "Intime", tag: "69" },
    { category: "Intime", tag: "Trio" },
    { category: "Intime", tag: "Lingerie" },
    { category: "Intime", tag: "Dominatrice" },
    { category: "Intime", tag: "Soumise" },
    { category: "Intime", tag: "Exhib" },
    { category: "Intime", tag: "Sexting" },
    { category: "Intime", tag: "Plan cam" },
    { category: "Intime", tag: "Préliminaires" },
    { category: "Intime", tag: "Sextoy" },
    { category: "Intime", tag: "Massage" },
    
    // Positions
    { category: "Position", tag: "Levrette" },
    { category: "Position", tag: "Missionnaire" },
    { category: "Position", tag: "Amazone" },
    { category: "Position", tag: "Cowgirl" },
    { category: "Position", tag: "Cuillère" },
    { category: "Position", tag: "69 debout" },
    { category: "Position", tag: "Lotus" },
    { category: "Position", tag: "Andromaque" },
  ];

  // Données Profil
  const [profils, setProfils] = React.useState<Profil[]>([
    {
      id: 1, 
      name: 'Sophie',
      nameJp: '腐った', 
      type: 'Séductrice', 
      rarity: 'Sociable', 
      power: 85, 
      height: '165 cm',
      weight: 'Moyenne',
      city: 'Paris',
      favorite: true,
      abilities: ['Initiative', 'Spontanéité', 'Charisme'],
      stats: { initiative: 85, discrétion: 50, spontanéité: 95 },
      description: 'Rencontrée lors d\'une soirée étudiante. Très vive et souriante.',
      customImage: true,
      imageData: undefined,
      score: 78,
      tags: ['Soirée', 'Premier RDV', 'Fellation'],
      meetingDate: '2023-05-15'
    },
    {
      id: 2, 
      name: 'Camille',
      nameJp: 'リザードン', 
      type: 'Passionnée', 
      rarity: 'Festive', 
      power: 95, 
      height: '171 cm',
      weight: 'Athlétique',
      city: 'Marseille',
      favorite: true,
      abilities: ['Charisme', 'Spontanéité', 'Initiative'],
      stats: { initiative: 95, discrétion: 78, spontanéité: 90 },
      description: 'Rencontrée en vacances. Passionnée et très intense.',
      customImage: false,
      imageData: undefined,
      score: 92,
      tags: ['Vacances', 'Étranger', 'Sodomie', '69'],
      meetingDate: '2023-07-20'
    },
    {
      id: 3, 
      name: 'Emma',
      nameJp: 'イーブイ', 
      type: 'Aventurière', 
      rarity: 'Indépendante', 
      power: 70, 
      height: '160 cm',
      weight: 'Fine',
      city: 'Lyon',
      favorite: false,
      abilities: ['Spontanéité', 'Initiative', 'Charisme'],
      stats: { initiative: 70, discrétion: 65, spontanéité: 75 },
      description: 'Match Tinder, versatile et imprévisible. Plusieurs personnalités en une.',
      customImage: false,
      imageData: undefined,
      score: 68,
      tags: ['Tinder', 'Coup d\'un soir', 'Fellation'],
      meetingDate: '2023-09-05'
    },
    {
      id: 4, 
      name: 'Léa',
      nameJp: 'ミュウツー', 
      type: 'Intellectuelle', 
      rarity: 'Équilibrée', 
      power: 98, 
      height: '175 cm',
      weight: 'Élancée',
      city: 'Nice',
      favorite: true,
      abilities: ['Charisme', 'Discrétion', 'Initiative'],
      stats: { initiative: 98, discrétion: 90, spontanéité: 96 },
      description: 'Mannequin rencontrée dans une soirée VIP. Intelligence exceptionnelle.',
      customImage: false,
      imageData: undefined,
      score: 100,
      tags: ['VIP', 'Festival', 'Lingerie', 'Soumise'],
      meetingDate: '2023-11-10'
    },
    {
      id: 5, 
      name: 'Chloé',
      nameJp: 'フシギバナ', 
      type: 'Créative', 
      rarity: 'Sociable', 
      power: 88, 
      height: '168 cm',
      weight: 'Tonique',
      city: 'Bordeaux',
      favorite: false,
      abilities: ['Initiative', 'Discrétion', 'Spontanéité'],
      stats: { initiative: 82, discrétion: 83, spontanéité: 80 },
      description: 'Rencontrée dans un bar à vin. Belle et élégante, repartie avec ses amies avant que je puisse lui proposer un verre.',
      customImage: false,
      imageData: undefined,
      score: 89,
      tags: ['Bar', 'Ami(e) commun(e)', 'Levrette'],
      meetingDate: '2023-12-05'
    }
  ]);

  // Cette variable n'est plus utilisée pour le recadrage mais gardons-la pour la détection du type de fichier
  // Ajout d'un état pour détecter les GIF animés
  const [isGif, setIsGif] = React.useState(false);

  // Fonctions pour les interactions
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSelectProfil = (profil: any) => {
    setSelectedProfil(profil);
    setEditingField(null);
  };

  const closeModal = () => {
    setSelectedProfil(null);
    setIsEditingName(false); // Réinitialise l'état d'édition du nom
    setEditingField(null);
  };

  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
  };

  const toggleFavorite = (id: number) => {
    setProfils(profils.map(profil => 
      profil.id === id ? {...profil, favorite: !profil.favorite} : profil
    ));
    
    if (selectedProfil && selectedProfil.id === id) {
      setSelectedProfil({...selectedProfil, favorite: !selectedProfil.favorite});
    }
  };

  const deleteProfile = (id: number) => {
    setProfils(profils.filter(profil => profil.id !== id));
    closeModal();
  };
  
  const toggleExportModal = () => {
    setShowExportModal(!showExportModal);
  };

  const toggleImportModal = () => {
    setShowImportModal(!showImportModal);
  };

  const toggleEditField = (field: string) => {
    setEditingField(editingField === field ? null : field);
  };

  // Fonction pour calculer le score basé sur plusieurs facteurs
  const calculateScore = (profil: Profil) => {
    // Calcul des stats (70%)
    const statsAvg = Object.values(profil.stats).reduce((a, b) => a + b, 0) / Object.values(profil.stats).length;
    const statsScore = statsAvg * 0.7;
    
    // Calcul basé sur le charisme (15%)
    const charismaScore = profil.power * 0.15;
    
    // Calcul basé sur le nombre d'activités (15%)
    const maxActivities = 10; // Nombre maximum d'activités pour un score parfait
    const activitiesScore = Math.min(profil.tags.length / maxActivities, 1) * 100 * 0.15;
    
    // Score final
    return Math.round(statsScore + charismaScore + activitiesScore);
  };

  // Types pour l'éditeur d'image
  interface ImageEditorData {
    originalSrc: string;
    position: { x: number; y: number };
    x: number;
    y: number;
    zoomFactor: number;
    type?: 'gif' | 'image'; // Ajout du type optionnel pour supporter les GIFs
  }

  // Fonction pour afficher une image de Profil
  const renderProfileImage = (profil: Profil, size: 'small' | 'medium' | 'large' = 'small') => {
    // Si le profil a une imageData qui est au format JSON, on utilise la transformation
    const useTranform = profil.imageData && isJsonImage(profil.imageData);
    
    let transformStyle: { backgroundSize: string; backgroundPosition: string } = {
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    };
    
    if (useTranform) {
      try {
        const imageData = JSON.parse(profil.imageData as string);
        transformStyle = {
          backgroundSize: imageData.zoomFactor ? `${imageData.zoomFactor * 100}%` : 'cover', // Ajusté à 100%
          backgroundPosition: imageData.position 
            ? `calc(50% + ${imageData.position.x}%) calc(50% + ${imageData.position.y}%)` 
            : 'center'
        };
      } catch (e) {
        console.error("Erreur parsing JSON de l'image", e);
      }
    }
    
    // Déterminer la taille en fonction du paramètre
    let sizeClass = '';
    switch(size) {
      case 'small':
        sizeClass = 'w-12 h-12';
        break;
      case 'medium':
        sizeClass = 'w-24 h-24';
        break;
      case 'large':
        sizeClass = 'w-64 h-64';
        break;
    }
    
    // Rendu de l'image avec transformation si disponible
    return (
      <div className={`rounded-full ${sizeClass} relative border-2`} 
          style={{ 
            borderColor: getTypeColorHighlight(profil.type)
          }}>
        <div className="w-full h-full bg-white/50 relative overflow-hidden rounded-full">
          {profil.imageData ? (
            <div 
              className="absolute inset-0 bg-center bg-no-repeat" 
              style={{ 
                backgroundImage: `url(${useTranform ? JSON.parse(profil.imageData as string).originalSrc : profil.imageData})`,
                backgroundSize: transformStyle.backgroundSize,
                backgroundPosition: transformStyle.backgroundPosition,
              }}
            ></div>
          ) : (
            <div className="w-full h-full flex items-center justify-center group">
              <span className="text-xl text-gray-600 group-hover:opacity-0 transition-opacity">{profil.name.charAt(0)}</span>
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera size={20} className="text-white" />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Mise à jour des scores pour tous les profils
  React.useEffect(() => {
    const updatedProfiles = profils.map(profil => ({
      ...profil,
      score: calculateScore(profil)
    }));
    setProfils(updatedProfiles);
  }, []);

  const updateProfileField = (id: number, field: string, value: any) => {
    setEditingField(null);
    
    // Créer une copie profonde pour éviter des problèmes de référence
    const updatedProfiles = profils.map(profil => {
      if (profil.id === id) {
        const updatedProfile = {...profil, [field]: value};
        
        // Vérification spéciale pour les images
        if (field === 'imageData') {
          updatedProfile.customImage = true;
        }
        
        // Recalculer le score si nécessaire
        if (field !== 'score') {
          updatedProfile.score = calculateScore(updatedProfile);
        }
        
        return updatedProfile;
      }
      return profil;
    });
    
    setProfils(updatedProfiles);
    
    if (selectedProfil && selectedProfil.id === id) {
      const updatedSelectedProfile = {...selectedProfil, [field]: value};
      
      // Vérification spéciale pour les images
      if (field === 'imageData') {
        updatedSelectedProfile.customImage = true;
      }
      
      // Recalculer le score si nécessaire
      if (field !== 'score') {
        updatedSelectedProfile.score = calculateScore(updatedSelectedProfile);
      }
      
      setSelectedProfil(updatedSelectedProfile);
    }
  };

  const updateProfileNestedField = (id: number, parentField: string, childField: string, value: any) => {
    const updatedProfiles = profils.map(profil => {
      if (profil.id === id) {
        const profilData = profil as any;
        const updatedProfile = {
          ...profil,
          [parentField]: {
            ...profilData[parentField],
            [childField]: value
          }
        };
        
        // Recalculer le score si nécessaire
        if (parentField !== 'score') {
          updatedProfile.score = calculateScore(updatedProfile);
        }
        
        return updatedProfile;
      }
      return profil;
    });
    
    setProfils(updatedProfiles);
    
    if (selectedProfil && selectedProfil.id === id) {
      const profilData = selectedProfil as any;
      const updatedSelectedProfile = {
        ...selectedProfil,
        [parentField]: {
          ...profilData[parentField],
          [childField]: value
        }
      };
      
      // Recalculer le score si nécessaire
      if (parentField !== 'score') {
        updatedSelectedProfile.score = calculateScore(updatedSelectedProfile);
      }
      
      setSelectedProfil(updatedSelectedProfile);
    }
    
    setEditingField(null);
  };

  // Style et couleurs selon type de profil avec des tons plus élégants et moins pastel
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Créative':
        return 'bg-gradient-to-br from-cyan-200 to-cyan-300 text-cyan-900';
      case 'Aventurière':
        return 'bg-gradient-to-br from-emerald-200 to-emerald-300 text-emerald-900';
      case 'Intellectuelle':
        return 'bg-gradient-to-br from-indigo-200 to-indigo-300 text-indigo-900';
      case 'Séductrice':
        return 'bg-gradient-to-br from-rose-200 to-rose-300 text-rose-900';
      case 'Spontanée':
        return 'bg-gradient-to-br from-amber-200 to-amber-300 text-amber-900';
      case 'Mystérieuse':
        return 'bg-gradient-to-br from-purple-200 to-purple-300 text-purple-900';
      case 'Passionnée':
        return 'bg-gradient-to-br from-red-200 to-red-300 text-red-900';
      case 'Déterminée':
        return 'bg-gradient-to-br from-blue-200 to-blue-300 text-blue-900';
      case 'Artistique':
        return 'bg-gradient-to-br from-fuchsia-200 to-fuchsia-300 text-fuchsia-900';
      case 'Sportive':
        return 'bg-gradient-to-br from-lime-200 to-lime-300 text-lime-900';
      case 'Introvertie':
        return 'bg-gradient-to-br from-slate-200 to-slate-300 text-slate-900';
      case 'Extravertie':
        return 'bg-gradient-to-br from-orange-200 to-orange-300 text-orange-900';
      case 'Pragmatique':
        return 'bg-gradient-to-br from-sky-200 to-sky-300 text-sky-900';
      case 'Sensible':
        return 'bg-gradient-to-br from-pink-200 to-pink-300 text-pink-900';
      case 'Indépendante':
        return 'bg-gradient-to-br from-teal-200 to-teal-300 text-teal-900';
      case 'Ambitieuse':
        return 'bg-gradient-to-br from-violet-200 to-violet-300 text-violet-900';
      case 'Charismatique':
        return 'bg-gradient-to-br from-yellow-200 to-yellow-300 text-yellow-900';
      case 'Réservée':
        return 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-900';
      default:
        return 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-900';
    }
  };

  const getTypeColorBorder = (type: string) => {
    switch (type) {
      case 'Créative':
        return 'border-cyan-200';
      case 'Aventurière':
        return 'border-emerald-200';
      case 'Intellectuelle':
        return 'border-indigo-200';
      case 'Séductrice':
        return 'border-rose-200';
      case 'Spontanée':
        return 'border-amber-200';
      case 'Mystérieuse':
        return 'border-purple-200';
      case 'Passionnée':
        return 'border-red-200';
      case 'Déterminée':
        return 'border-blue-200';
      case 'Artistique':
        return 'border-fuchsia-200';
      case 'Sportive':
        return 'border-lime-200';
      case 'Introvertie':
        return 'border-slate-200';
      case 'Extravertie':
        return 'border-orange-200';
      case 'Pragmatique':
        return 'border-sky-200';
      case 'Sensible':
        return 'border-pink-200';
      case 'Indépendante':
        return 'border-teal-200';
      case 'Ambitieuse':
        return 'border-violet-200';
      case 'Charismatique':
        return 'border-yellow-200';
      case 'Réservée':
        return 'border-gray-200';
      default:
        return 'border-gray-200';
    }
  };

  // Fonction pour obtenir la couleur du liseré externe (version plus claire)
  const getTypeColorHighlight = (type: string) => {
    // Utiliser une version extrêmement claire de la couleur du type
    switch (type) {
      case 'Créative':
        return 'rgba(252, 225, 225, 0.5)'; // Rouge très clair
      case 'Aventurière':
        return 'rgba(219, 234, 254, 0.5)'; // Bleu très clair
      case 'Intellectuelle':
        return 'rgba(229, 250, 239, 0.5)'; // Vert très clair
      case 'Séductrice':
        return 'rgba(250, 232, 255, 0.5)'; // Rose très clair
      case 'Spontanée':
        return 'rgba(254, 249, 219, 0.5)'; // Jaune très clair
      case 'Mystérieuse':
        return 'rgba(250, 232, 255, 0.5)'; // Rose très clair
      case 'Passionnée':
        return 'rgba(254, 242, 242, 0.5)'; // Rouge-orange très clair
      case 'Déterminée':
        return 'rgba(249, 250, 251, 0.5)'; // Gris très clair
      case 'Artistique':
        return 'rgba(250, 232, 255, 0.5)'; // Rose très clair
      case 'Sportive':
        return 'rgba(229, 250, 239, 0.5)'; // Vert très clair
      case 'Introvertie':
        return 'rgba(249, 250, 251, 0.5)'; // Gris très clair
      case 'Extravertie':
        return 'rgba(250, 232, 255, 0.5)'; // Rose très clair
      case 'Pragmatique':
        return 'rgba(249, 250, 251, 0.5)'; // Gris très clair
      case 'Sensible':
        return 'rgba(250, 232, 255, 0.5)'; // Rose très clair
      case 'Indépendante':
        return 'rgba(229, 250, 239, 0.5)'; // Vert très clair
      case 'Ambitieuse':
        return 'rgba(250, 232, 255, 0.5)'; // Rose très clair
      case 'Charismatique':
        return 'rgba(250, 232, 255, 0.5)'; // Rose très clair
      case 'Réservée':
        return 'rgba(249, 250, 251, 0.5)'; // Gris très clair
      default:
        return 'rgba(249, 250, 251, 0.5)'; // Gris très clair par défaut
    }
  };

  // Nouvelle fonction: système de couleurs amélioré pour les scores
  const getScoreGradient = (score: number) => {
    // Système de couleurs professionnelles et élégantes
    if (score < 40) {
      // Bleu-gris léger pour les scores faibles
      return 'bg-gradient-to-br from-slate-50 to-slate-200 text-slate-700 border border-slate-300/40';
    } else if (score < 60) {
      // Bleu-vert léger pour les scores moyens-faibles
      return 'bg-gradient-to-br from-sky-50 to-sky-100 text-sky-700 border border-sky-200/40';
    } else if (score < 75) {
      // Turquoise pour les scores moyens
      return 'bg-gradient-to-br from-teal-50 to-teal-100 text-teal-700 border border-teal-200/40';
    } else if (score < 85) {
      // Vert pour les bons scores
      return 'bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700 border border-emerald-200/40';
    } else if (score < 95) {
      // Violet pour les très bons scores
      return 'bg-gradient-to-br from-violet-50 to-violet-100 text-violet-700 border border-violet-200/40';
    } else {
      // Or/Ambre pour les scores excellents
      return 'bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700 border border-amber-200/40';
    }
  };

  const getRarityStyle = (rarity: string) => {
    switch (rarity) {
      case 'Indépendante':
        return 'text-teal-700';
      case 'Sociable':
        return 'text-blue-700';
      case 'Casanière':
        return 'text-indigo-700';
      case 'Festive':
        return 'text-pink-700';
      case 'Voyageuse':
        return 'text-emerald-700';
      case 'Équilibrée':
        return 'text-purple-700';
      case 'Workaholic':
        return 'text-slate-700';
      case 'Bohème':
        return 'text-amber-700';
      case 'Alternative':
        return 'text-sky-700';
      case 'Classique':
        return 'text-gray-700';
      case 'Luxe':
        return 'text-yellow-700';
      case 'Minimaliste':
        return 'text-stone-700';
      default:
        return 'text-gray-700';
    }
  };

  // Filtrer les profils selon la recherche et l'onglet actif
  const filteredProfiles = profils.filter(profil => {
    const matchesSearch = profil.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          profil.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (profil.tags && profil.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesFavorites = activeTab === 'favorites' ? profil.favorite : true;
    return matchesSearch && matchesFavorites;
  });

  // Export des données
  const exportData = () => {
    if (showExportModal) {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profils));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "conquetes.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      setShowExportModal(false);
    }
  };

  // Import des données
  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          if (event.target && typeof event.target.result === 'string') {
            const fileExt = file.name.split('.').pop()?.toLowerCase();
            
            if (fileExt === 'json') {
              // Traitement JSON existant
              const importedData = JSON.parse(event.target.result);
              if (Array.isArray(importedData)) {
                setProfils(importedData);
                setShowImportModal(false);
              }
            } else if (fileExt === 'csv' || fileExt === 'xlsx' || fileExt === 'xls') {
              // Traitement CSV/Excel (simulé - normalement nécessiterait une bibliothèque)
              const rows = event.target.result.split('\n');
              // Premier ligne contient les entêtes
              const headers = rows[0].split(',').map(h => h.trim());
              
              const newProfils: Profil[] = [];
              // Parcourir chaque ligne à partir de la deuxième (index 1)
              for (let i = 1; i < rows.length; i++) {
                if (rows[i].trim() === '') continue; // Ignorer les lignes vides
                
                const values = rows[i].split(',').map(v => v.trim());
                
                // Mapper les données selon les entêtes connus
                const nameIndex = headers.findIndex(h => 
                  h.toLowerCase().includes('nom') || 
                  h.toLowerCase().includes('name') || 
                  h.toLowerCase() === 'prénom'
                );
                
                const cityIndex = headers.findIndex(h => 
                  h.toLowerCase().includes('ville') || 
                  h.toLowerCase().includes('city') || 
                  h.toLowerCase().includes('location')
                );
                
                const typeIndex = headers.findIndex(h => 
                  h.toLowerCase().includes('type') || 
                  h.toLowerCase().includes('personnalité') || 
                  h.toLowerCase().includes('personality')
                );
                
                const dateIndex = headers.findIndex(h => 
                  h.toLowerCase().includes('date') || 
                  h.toLowerCase().includes('rencontre') || 
                  h.toLowerCase().includes('meeting')
                );
                
                const descriptionIndex = headers.findIndex(h => 
                  h.toLowerCase().includes('description') || 
                  h.toLowerCase().includes('notes') || 
                  h.toLowerCase().includes('commentaire')
                );
                
                // Définir un type selon les données, ou prendre un par défaut
                let type = 'Créative';
                if (typeIndex >= 0 && values[typeIndex]) {
                  // Trouver le type le plus proche dans la liste des types disponibles
                  const userType = values[typeIndex].toLowerCase();
                  const matchingType = personalityTypes.find(t => 
                    t.toLowerCase() === userType || 
                    t.toLowerCase().includes(userType) || 
                    userType.includes(t.toLowerCase())
                  );
                  if (matchingType) type = matchingType;
                }
                
                // Créer un nouveau profil avec les données mappées
                const newId = Math.max(...profils.map(p => p.id), 0) + 1 + i;
                const newProfil: Profil = {
                  id: newId,
                  name: nameIndex >= 0 && values[nameIndex] ? values[nameIndex] : `Profil ${newId}`,
                  nameJp: '新しい', 
                  type: type,
                  rarity: 'Sociable', // Par défaut
                  power: 50,
                  height: '165 cm',
                  weight: 'Moyenne',
                  city: cityIndex >= 0 && values[cityIndex] ? values[cityIndex] : 'Paris',
                  favorite: false,
                  abilities: ['Initiative', 'Spontanéité', 'Charisme'],
                  stats: { initiative: 50, discrétion: 50, spontanéité: 50 },
                  description: descriptionIndex >= 0 && values[descriptionIndex] 
                    ? values[descriptionIndex] 
                    : 'Importé depuis fichier externe.',
                  customImage: false,
                  imageData: undefined,
                  score: 50,
                  tags: ['Importé'],
                  meetingDate: dateIndex >= 0 && values[dateIndex] 
                    ? new Date(values[dateIndex]).toISOString().split('T')[0]
                    : new Date().toISOString().split('T')[0]
                };
                
                newProfils.push(newProfil);
              }
              
              // Ajouter les nouveaux profils à la liste existante
              if (newProfils.length > 0) {
                setProfils([...profils, ...newProfils]);
                setShowImportModal(false);
              }
            } else {
              alert('Format de fichier non pris en charge. Utilisez JSON, CSV ou Excel.');
            }
          }
        } catch (error) {
          console.error("Erreur lors de l'importation des données :", error);
          alert("Erreur lors de l'importation. Vérifiez le format de votre fichier.");
        }
      };
      
      reader.readAsText(file);
    }
  };

  // Modification du gestionnaire d'upload d'image pour utiliser l'éditeur d'image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Vérification du type de fichier
      if (!file.type.match('image.*') && !file.type.match('image/gif')) {
        alert("Seules les images sont acceptées");
        return;
      }
      
      // Vérification de la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("L'image ne doit pas dépasser 5MB");
        return;
      }
      
      // Détection des GIFs
      const isGifImage = file.type === 'image/gif';
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          const imageData = event.target.result.toString();
          
          // Utiliser l'ID du profil sélectionné s'il existe
          if (isGifImage) {
            const gifData: ImageEditorData = {
              type: 'gif',
              originalSrc: imageData,
              position: { x: 0, y: 0 },
              x: 0,
              y: 0,
              zoomFactor: 1
            };
            openImageEditor(JSON.stringify(gifData), selectedProfil?.id || -1);
          } else {
            openImageEditor(imageData, selectedProfil?.id || -1);
          }
          setShowAddForm(false);
        }
      };
      
      reader.onerror = (error) => {
        console.error("Erreur de lecture du fichier:", error);
        alert("Une erreur est survenue lors de la lecture du fichier. Veuillez réessayer.");
      };
      
      reader.readAsDataURL(file);
    }
  };

  // Fonction pour formater une date en format français
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Non spécifiée';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }).format(date);
  };

  // Rendu d'un champ éditable
  const renderEditableField = (id: number, field: string, value: any, label: string, options?: string[]) => {
    const isEditingThis = editingField === field;
    
    // Définir un type et une valeur par défaut pour éviter les problèmes avec undefined
    const safeValue = value !== undefined ? value : '';
    
    if (isEditingThis) {
      if (field === 'meetingDate') {
        return (
          <div className="relative w-full p-2 rounded bg-white border shadow-sm">
            <label htmlFor={`edit-${field}-${id}`} className="text-xs text-gray-500 mb-1 block">{label}</label>
            <input 
              id={`edit-${field}-${id}`}
              type="date"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-zinc-300 text-base"
              value={safeValue}
              onChange={(e) => updateProfileField(id, field, e.target.value)}
              autoFocus
              onBlur={() => setEditingField(null)}
              title={`Modifier la ${label.toLowerCase()}`}
            />
          </div>
        );
      } else if (options && options.length > 0) {
        return (
          <div className="relative w-full p-2 rounded bg-white border shadow-sm">
            <label htmlFor={`edit-${field}-${id}`} className="text-xs text-gray-500 mb-1 block">{label}</label>
            <select 
              id={`edit-${field}-${id}`}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-zinc-300 text-base"
              value={safeValue}
              onChange={(e) => {
                updateProfileField(id, field, e.target.value);
                setEditingField(null);
              }}
              autoFocus
              title={`Sélectionner ${label}`}
            >
              {options.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );
      } else {
        return (
          <div className="relative w-full p-2 rounded bg-white border shadow-sm">
            <label htmlFor={`edit-${field}-${id}`} className="text-xs text-gray-500 mb-1 block">{label}</label>
            <input 
              id={`edit-${field}-${id}`}
              type={field === 'score' || field === 'power' ? 'number' : 'text'}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-zinc-300 text-base"
              value={safeValue}
              min={field === 'score' || field === 'power' ? 0 : undefined}
              max={field === 'score' || field === 'power' ? 100 : undefined}
              onChange={(e) => updateProfileField(id, field, e.target.value)}
              autoFocus
              onBlur={() => setEditingField(null)}
              placeholder={`Entrez ${label.toLowerCase()}`}
              title={`Entrez ${label.toLowerCase()}`}
            />
          </div>
        );
      }
    }
    
    return (
      <div 
        className="p-2 rounded bg-white border hover:bg-gray-50 cursor-pointer shadow-sm"
        onClick={() => toggleEditField(field)}
      >
        <p className="text-xs text-gray-500">{label}</p>
        <p className={`font-medium ${field === 'rarity' ? getRarityStyle(safeValue) : ''}`}>
          {field === 'meetingDate' 
            ? formatDate(safeValue) // Utiliser la nouvelle fonction formatDate 
            : safeValue
          } {field === 'power' ? '✨' : ''}
        </p>
      </div>
    );
  };

  // Fonctions pour l'éditeur d'image
  const openImageEditor = (imageUrl: string, id: number) => {
    // Toujours utiliser la nouvelle image lorsqu'une image est explicitement fournie
    const profil = profils.find(p => p.id === id);
    
    // Cas d'une image existante avec des paramètres d'édition à récupérer
    if (profil && profil.imageData && isJsonImage(profil.imageData) && !imageUrl.includes('data:image')) {
      try {
        // Récupérer les données d'édition précédentes si ce n'est pas un nouvel upload
        const data = JSON.parse(profil.imageData as string);
        if (data.type === 'gif') {
          setImageToEdit(data.originalSrc);
        } else {
          setImageToEdit(data.originalSrc);
        }
        setProfileIdToEdit(id);
        setImagePosition(data.position);
        setZoomFactor(data.zoomFactor);
        setIsEditingImage(true);
        return;
      } catch (e) {
        console.error("Erreur lors de la récupération des données d'image:", e);
      }
    }
    
    // Pour les GIFs nouvellement importés
    if (imageUrl.startsWith('{"type":"gif"')) {
      try {
        const data = JSON.parse(imageUrl);
        setImageToEdit(data.originalSrc);
        setProfileIdToEdit(id);
        setImagePosition({ x: 0, y: 0 });
        setZoomFactor(1);
        setIsEditingImage(true);
        return;
      } catch (e) {
        console.error("Erreur lors de la récupération des données de GIF:", e);
      }
    }
    
    // Si c'est une nouvelle image ou s'il y a eu une erreur
    setImageToEdit(imageUrl);
    setProfileIdToEdit(id);
    setImagePosition({ x: 0, y: 0 });
    setZoomFactor(1);
    setIsEditingImage(true);
  };

  const closeImageEditor = () => {
    setIsEditingImage(false);
    setImageToEdit(null);
    setProfileIdToEdit(null);
  };

  const decreaseZoom = () => {
    setZoomFactor(Math.max(1, zoomFactor - 0.1));
  };

  const increaseZoom = () => {
    setZoomFactor(Math.min(5, zoomFactor + 0.1));
  };

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleDragMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      setImagePosition({
        x: imagePosition.x - deltaX / 270 * 100,
        y: imagePosition.y - deltaY / 270 * 100
      });
      
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const saveEditedImage = () => {
    if (!imageToEdit) return;

    const imageData = generateImageData();
    
    if (profileIdToEdit === -1) {
      // Création d'un nouveau profil avec la photo
      const newId = Math.max(...profils.map(p => p.id), 0) + 1;
      const newProfil: Profil = {
        id: newId,
        name: 'Nouveau profil',
        nameJp: '新しい', 
        type: 'Créative',
        rarity: 'Sociable',
        power: 50,
        height: '165 cm',
        weight: 'Moyenne',
        city: 'Paris',
        favorite: false,
        abilities: ['Initiative', 'Spontanéité', 'Charisme'],
        stats: { initiative: 50, discrétion: 50, spontanéité: 50 },
        description: 'Ajoutez une description...',
        customImage: true,
        imageData: imageData,
        score: 50,
        tags: ['À classer'],
        meetingDate: new Date().toISOString().split('T')[0]
      };
      
      setProfils([...profils, newProfil]);
      setSelectedProfil(newProfil);
    } else if (profileIdToEdit !== null) {
      // Modification d'un profil existant
      const updatedProfils = profils.map(profil => 
        profil.id === profileIdToEdit
          ? { ...profil, imageData: imageData, customImage: true }
          : profil
      );
      setProfils(updatedProfils);
      
      // Mise à jour du profil sélectionné si c'est celui qui est modifié
      if (selectedProfil && selectedProfil.id === profileIdToEdit) {
        setSelectedProfil({ ...selectedProfil, imageData: imageData, customImage: true });
      }
    }
    
    closeImageEditor();
  };

  // Fonction pour générer les données d'image avec les paramètres d'édition
  const generateImageData = (): string | undefined => {
    if (!imageToEdit) return undefined;

    if (imageToEdit.startsWith('{"type":"gif"')) {
      // C'est un GIF, on retourne les données JSON telles quelles
      return imageToEdit;
    }

    // Pour une image normale, on crée un objet avec les paramètres d'édition
    const imageData: ImageEditorData = {
      type: 'image',
      originalSrc: imageToEdit,
      position: imagePosition,
      x: imagePosition.x,
      y: imagePosition.y,
      zoomFactor: zoomFactor
    };

    return JSON.stringify(imageData);
  };

  const handleNewProfile = () => {
    // Création d'un nouveau profil vide
    const newId = Math.max(...profils.map(p => p.id), 0) + 1;
    const newProfil: Profil = {
      id: newId,
      name: 'Nouveau profil',
      nameJp: '新しい', 
      type: 'Créative',
      rarity: 'Sociable',
      power: 50,
      height: '165 cm',
      weight: 'Moyenne',
      city: 'Paris',
      favorite: false,
      abilities: ['Initiative', 'Spontanéité', 'Charisme'],
      stats: { initiative: 50, discrétion: 50, spontanéité: 50 },
      description: 'Ajoutez une description...',
      customImage: false,
      imageData: undefined,
      score: 50,
      tags: ['À classer'],
      meetingDate: new Date().toISOString().split('T')[0]
    };
    
    setProfils([...profils, newProfil]);
    setSelectedProfil(newProfil);
    setShowAddForm(false);
  };

  // État pour gérer l'édition du nom
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [nameInputValue, setNameInputValue] = React.useState('');
  const nameInputRef = React.createRef<HTMLInputElement>();

  // Fonction pour commencer l'édition du nom
  const startEditingName = () => {
    if (selectedProfil) {
      setNameInputValue(selectedProfil.name);
      setIsEditingName(true);
      setTimeout(() => {
        if (nameInputRef.current) {
          nameInputRef.current.focus();
          nameInputRef.current.select();
        }
      }, 10);
    }
  };

  // Fonction pour sauvegarder le nom modifié
  const saveEditedName = () => {
    if (selectedProfil && nameInputValue.trim()) {
      const updatedProfils = profils.map(profil => 
        profil.id === selectedProfil.id
          ? { ...profil, name: nameInputValue.trim() }
          : profil
      );
      setProfils(updatedProfils);
      setSelectedProfil({ ...selectedProfil, name: nameInputValue.trim() });
    }
    setIsEditingName(false);
  };

  // Gérer la touche Entrée pour sauvegarder le nom
  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEditedName();
    } else if (e.key === 'Escape') {
      setIsEditingName(false);
    }
  };

  // État pour la fenêtre de sélection des tags
  const [showTagsModal, setShowTagsModal] = React.useState(false);
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [tempSelectedTags, setTempSelectedTags] = React.useState<string[]>([]);

  // Catégories de tags
  const tagCategories = {
    "Rencontre": ["Soirée", "Vacances", "Travail", "Bar", "Club", "Festival", "Premier RDV", "Ami(e) commun(e)", "Boîte", "VIP", "Étranger", "Plage", "Concert"],
    "App": ["Tinder", "Bumble", "Hinge", "Happn", "Fruitz", "Grindr", "OkCupid"],
    "Relation": ["Coup d'un soir", "Relation", "Ex", "Plan cul régulier", "Amis avec bénéfices"],
    "Intime": ["Fellation", "Sodomie", "BDSM", "69", "Trio", "Lingerie", "Dominatrice", "Soumise", "Exhib", "Sexting", "Plan cam", "Préliminaires", "Sextoy", "Massage"],
    "Position": ["Levrette", "Missionnaire", "Amazone", "Cowgirl", "Cuillère", "69 debout", "Lotus", "Andromaque"]
  };

  // Fonction pour ouvrir le modal de sélection des tags
  const openTagsModal = () => {
    if (selectedProfil) {
      setTempSelectedTags([...selectedProfil.tags]);
      setShowTagsModal(true);
    }
  };

  // Fonction pour fermer le modal de tags
  const closeTagsModal = () => {
    setShowTagsModal(false);
    // Réinitialiser les tags sélectionnés temporairement
    if (selectedProfil) {
      setTempSelectedTags([...selectedProfil.tags]);
    }
  };

  // Fonction pour basculer un tag
  const toggleTag = (tag: string) => {
    if (tempSelectedTags.includes(tag)) {
      setTempSelectedTags(tempSelectedTags.filter(t => t !== tag));
    } else {
      setTempSelectedTags([...tempSelectedTags, tag]);
    }
  };

  // Fonction pour sauvegarder les tags sélectionnés
  const saveSelectedTags = () => {
    if (selectedProfil) {
      const updatedProfils = profils.map(profil => 
        profil.id === selectedProfil.id
          ? { ...profil, tags: tempSelectedTags }
          : profil
      );
      setProfils(updatedProfils);
      setSelectedProfil({ ...selectedProfil, tags: tempSelectedTags });
      closeTagsModal();
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-50 text-zinc-800 max-w-lg mx-auto shadow-xl">
      {/* Barre de recherche */}
      <div className="sticky top-0 z-10 bg-white p-2 pt-3 flex items-center justify-between">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 border border-stone-200 bg-stone-50 rounded-full">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Rechercher..." 
            className="w-full bg-transparent outline-none text-sm"
            value={searchTerm}
            onChange={handleSearch}
            id="searchTermInput"
            name="searchTermInput"
          />
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 overflow-auto p-3">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-4">
            {filteredProfiles.map(profil => (
              <div 
                key={profil.id} 
                className="border border-stone-200 bg-white cursor-pointer rounded-lg overflow-hidden shadow-sm relative" 
                onClick={() => handleSelectProfil(profil)}
              >
                <div className={`h-36 flex flex-col ${getTypeColor(profil.type)}`}>
                  {/* Prénom avec position optimisée */}
                  <div className="relative z-10 pt-[8px] pb-2 px-4 flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <Heart className={`${['Fellation', 'Sodomie', 'BDSM', '69', 'Trio', 'Levrette', 'Amazone', 'Cowgirl', 'Soumise', 'Dominatrice', 'Lingerie', 'Exhib', 'Sexting', 'Plan cam', 'Préliminaires', 'Sextoy', 'Massage'].some(tag => profil.tags.includes(tag)) ? "text-pink-500 fill-pink-500" : "text-white/90"}`} size={18} />
                      <span className="text-sm font-semibold text-white">{profil.score}</span>
                    </div>
                    <p className="text-xl font-bold truncate max-w-[50%] text-white">{profil.name}</p>
                    <button 
                      onClick={(e) => {e.stopPropagation(); toggleFavorite(profil.id)}}
                      title={profil.favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                      className="flex items-center justify-center"
                    >
                      <Star className={`${profil.favorite ? "text-amber-400 fill-amber-400" : "text-white/90"}`} size={18} />
                    </button>
                  </div>
                  
                  <div className="flex-grow flex items-center justify-center relative">
                    <div className="text-center w-full flex flex-col items-center h-full pb-3 pt-1">
                      {/* Cercle plus petit et centré avec position fixe */}
                      <div className="relative flex items-center justify-center">
                        {/* Cercle principal avec bordure qui correspond à la couleur du fond */}
                        <div className={`w-28 h-28 rounded-full flex items-center justify-center overflow-hidden relative z-50 isolate bg-white/20 border border-white/30 group`}>
                          {renderProfileImage(profil, 'medium')}
                          <div className="absolute inset-0 bg-transparent group-hover:bg-black/30 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                            <label htmlFor={`profile-upload-grid-${profil.id}`} className="cursor-pointer w-full h-full flex flex-col items-center justify-center text-white">
                              <Camera size={20} />
                            </label>
                            <input 
                              type="file" 
                              id={`profile-upload-grid-${profil.id}`} 
                              accept="image/*,.gif" 
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              style={{ zIndex: 50 }}
                              onChange={(e) => handleImageUpload(e)} 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-3">
                  <div className="flex flex-col">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium text-gray-800">{profil.type}</span>
                      {profil.tags && profil.tags.length > 0 && (
                        <div className="rounded-full bg-gray-100 px-2.5 py-0.5">
                          <span className="text-xs text-gray-700">{profil.tags.length} activité{profil.tags.length !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center mt-2 text-xs">
                      <span className="text-gray-600">{profil.city || 'Non spécifiée'}</span>
                      <span className="text-gray-500">{formatDate(profil.meetingDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProfiles.map(profil => (
              <div 
                key={profil.id} 
                className="border border-stone-200 bg-white cursor-pointer flex" 
                onClick={() => handleSelectProfil(profil)}
              >
                <div className={`w-16 h-16 flex items-center justify-center relative ${getTypeColor(profil.type)} group`}>
                  {/* Icônes en haut */}
                  <div className="absolute top-1 left-1 flex items-center">
                    <Heart className={`${['Fellation', 'Sodomie', 'BDSM', '69', 'Trio', 'Levrette', 'Amazone', 'Cowgirl', 'Soumise', 'Dominatrice', 'Lingerie', 'Exhib', 'Sexting', 'Plan cam', 'Préliminaires', 'Sextoy', 'Massage'].some(tag => profil.tags.includes(tag)) ? "text-pink-500 fill-pink-500" : "text-white/90"}`} size={14} />
                    <span className="text-xs font-semibold text-white ml-0.5">{profil.score}</span>
                  </div>
                  
                  {/* Étoile favorite en haut à droite */}
                  <div className="absolute top-1 right-1">
                    <button
                      onClick={(e) => {e.stopPropagation(); toggleFavorite(profil.id)}}
                      title={profil.favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                      className="flex items-center justify-center"
                    >
                      <Star className={`${profil.favorite ? "text-amber-400 fill-amber-400" : "text-white/90"}`} size={14} />
                    </button>
                  </div>
                  
                  <div className="w-12 h-12 rounded-full bg-white/50 flex items-center justify-center overflow-hidden group relative" style={{ aspectRatio: '1/1' }}>
                    {renderProfileImage(profil, 'small')}
                    <div className="absolute inset-0 bg-transparent group-hover:bg-black/30 text-white rounded-full flex flex-col items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                      <label htmlFor={`profile-upload-list-${profil.id}`} className="cursor-pointer w-full h-full flex flex-col items-center justify-center text-white">
                        <Camera size={16} />
                      </label>
                      <input 
                        type="file" 
                        id={`profile-upload-list-${profil.id}`} 
                        accept="image/*,.gif" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        style={{ zIndex: 50 }}
                        onChange={(e) => handleImageUpload(e)}
                      />
                    </div>
                  </div>
                </div>
                <div className="p-3 flex-grow">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex justify-between items-start w-full">
                        <p className="font-medium">{profil.name}</p>
                        {profil.tags && profil.tags.length > 0 && (
                          <div className="rounded-full bg-gray-100 px-2 py-0.5 ml-2">
                            <span className="text-xs text-gray-700">{profil.tags.length} activité{profil.tags.length !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-center mt-0.5 text-xs w-full">
                        <span className="text-gray-600">{profil.type} • {profil.city || 'Non spécifiée'}</span>
                        <span className="text-gray-500">{formatDate(profil.meetingDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal pour les détails d'un Profil */}
      {selectedProfil && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black/80 z-50 p-4 isolate"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="bg-white w-full max-w-md max-h-[80vh] overflow-auto rounded-lg shadow-lg flex flex-col">
            <div className="sticky top-0 z-10 bg-white">
              <div className="flex justify-between items-center p-4 border-b">
                {isEditingName ? (
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={nameInputValue}
                    onChange={(e) => setNameInputValue(e.target.value)}
                    onBlur={saveEditedName}
                    onKeyDown={handleNameKeyDown}
                    className="text-lg font-semibold bg-white/60 border-0 rounded-md px-3 py-1.5 w-full focus:outline-none focus:ring-0 focus:bg-white/75 shadow-sm"
                    style={{
                      borderBottom: `2px solid ${getTypeColorBorder(selectedProfil.type).replace('border-', '')}`,
                    }}
                    maxLength={30}
                  />
                ) : (
                  <h2 
                    className="text-lg font-semibold cursor-pointer group flex items-center" 
                    onClick={startEditingName}
                  >
                    {selectedProfil.name}
                    <Edit size={14} className="ml-2 opacity-0 group-hover:opacity-50 text-gray-500" />
                  </h2>
                )}
                <button 
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                  title="Fermer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            
            <div className={`p-4 ${getTypeColor(selectedProfil.type)}`}>
              <div className="flex items-center">
                {/* Photo de profil - Solution ULTRA RADICALE sans risque de parasites */}
                <div className="relative w-24 h-24 mr-6 group">
                  {/* Structure complètement hermétique et isolée */}
                  <div className="absolute inset-0 rounded-full shadow-lg overflow-hidden z-50 isolate flex items-center justify-center" style={{ 
                    boxShadow: selectedProfil ? `inset 0 0 0 2px ${getTypeColorBorder(selectedProfil.type).replace('border-', '')}, 
                        0 0 0 2px ${getTypeColorHighlight(selectedProfil.type)}` : 'none',
                    border: 'none',
                    cursor: isDragging ? 'grabbing' : 'grab'
                  }}>
                    {/* Fond blanc de base */}
                    <div className="absolute inset-0 bg-white/70"></div>
                    
                    {/* Image de profil avec priorité maximale et isolation */}
                    <div 
                      className="absolute inset-0 z-20 isolate"
                      style={{
                        backgroundImage: selectedProfil.imageData ? 
                          `url(${
                            isJsonImage(selectedProfil.imageData) ? 
                              (function() {
                                try {
                                  const data = JSON.parse(selectedProfil.imageData as string);
                                  return data.originalSrc || '';
                                } catch {
                                  return '';
                                }
                              })() : selectedProfil.imageData
                          })` : 'none',
                        backgroundPosition: isJsonImage(selectedProfil.imageData) ? 
                          (function() {
                            try {
                              const data = JSON.parse(selectedProfil.imageData as string);
                              return data.position ? `calc(50% + ${data.position.x}%) calc(50% + ${data.position.y}%)` : 'center';
                            } catch {
                              return 'center';
                            }
                          })() : 'center',
                        backgroundSize: isJsonImage(selectedProfil.imageData) ? 
                          (function() {
                            try {
                              const data = JSON.parse(selectedProfil.imageData as string);
                              return data.zoomFactor ? `${data.zoomFactor * 100}%` : 'cover'; // Ajusté à 100%
                            } catch {
                              return 'cover';
                            }
                          })() : 'cover'
                      }}
                    >
                      {/* Afficher l'initiale seulement si pas d'image */}
                      {!selectedProfil.imageData && (
                        <div className="w-full h-full flex items-center justify-center group">
                          <span className="text-xl text-gray-600 group-hover:opacity-0 transition-opacity">{selectedProfil.name.charAt(0)}</span>
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Camera size={20} className="text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Le bouton upload avec une meilleure visibilité */}
                  <div className="absolute inset-0" style={{ zIndex: 100 }}>
                    <input 
                      type="file" 
                      id={`profile-upload-${selectedProfil.id}`} 
                      accept="image/*,.gif" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      style={{ zIndex: 50 }}
                      onChange={(e) => handleImageUpload(e)} 
                    />
                    <label 
                      htmlFor={`profile-upload-${selectedProfil.id}`} 
                      className="block w-full h-full rounded-full cursor-pointer"
                    >
                      <div className="absolute inset-0 bg-transparent group-hover:bg-black/30 text-white rounded-full flex flex-col items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                        <Camera size={24} />
                      </div>
                    </label>
                  </div>
                </div>
                
                {/* Informations de profil */}
                <div className="flex-1">
                  {isEditingName ? (
                    <input
                      ref={nameInputRef}
                      type="text"
                      value={nameInputValue}
                      onChange={(e) => setNameInputValue(e.target.value)}
                      onBlur={saveEditedName}
                      onKeyDown={handleNameKeyDown}
                      className="text-lg font-semibold bg-white/60 border-0 rounded-md px-3 py-1.5 w-full focus:outline-none focus:ring-0 focus:bg-white/75 shadow-sm"
                      style={{
                        borderBottom: `2px solid ${getTypeColorBorder(selectedProfil.type).replace('border-', '')}`,
                      }}
                      maxLength={30}
                    />
                  ) : (
                    <h2 
                      className="text-lg font-semibold cursor-pointer group flex items-center" 
                      onClick={startEditingName}
                    >
                      {selectedProfil.name}
                      <Edit size={14} className="ml-2 opacity-0 group-hover:opacity-50 text-gray-500" />
                    </h2>
                  )}
                  <div className="flex items-center mb-2">
                    <span className="text-zinc-900 text-sm font-medium drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">{selectedProfil.type}</span>
                    <span className="mx-2 text-zinc-800/70">•</span>
                    <span className="text-zinc-900 text-sm font-medium drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">{selectedProfil.rarity}</span>
                  </div>
                  {selectedProfil.meetingDate && (
                    <div className="text-zinc-900 text-xs flex items-center drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">
                      <Calendar size={12} className="mr-1" />
                      {formatDate(selectedProfil.meetingDate)}
                    </div>
                  )}
                </div>
                
                {/* Boutons d'action et score dans le coin */}
                <div className="absolute top-2 right-2 flex gap-2 items-center">
                  <button 
                    onClick={() => toggleFavorite(selectedProfil.id)}
                    className="p-2 bg-white/80 rounded-full shadow-sm"
                    title={selectedProfil.favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                  >
                    <Heart className={`${selectedProfil.favorite ? "text-red-500 fill-red-500" : "text-gray-400"}`} size={18} />
                  </button>
                  <div className={`px-2 py-1 rounded-full text-sm font-medium shadow-sm ${getScoreGradient(selectedProfil.score)}`}>
                    {selectedProfil.score}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              {/* Caractéristiques principales avec menus déroulants */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {renderEditableField(selectedProfil.id, 'type', selectedProfil.type, 'Type', personalityTypes)}
                {renderEditableField(selectedProfil.id, 'city', selectedProfil.city, 'Ville', frenchCities)}
                {renderEditableField(selectedProfil.id, 'rarity', selectedProfil.rarity, 'Style de vie', lifestyleOptions)}
                {renderEditableField(selectedProfil.id, 'power', selectedProfil.power, 'Charisme')}
                {renderEditableField(selectedProfil.id, 'height', selectedProfil.height, 'Taille', heightOptions)}
                {renderEditableField(selectedProfil.id, 'weight', selectedProfil.weight, 'Silhouette', silhouetteOptions)}
                {renderEditableField(selectedProfil.id, 'score', selectedProfil.score, 'Score')}
                {renderEditableField(selectedProfil.id, 'meetingDate', selectedProfil.meetingDate, 'Date rencontre')}

                <div className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50 col-span-2" onClick={openTagsModal}>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-medium text-gray-700">Activités</p>
                      <span className="text-xs text-gray-500">({selectedProfil.tags.length})</span>
                    </div>
                    {selectedProfil.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedProfil.tags.slice(0, 8).map((tag: string, i: number) => (
                          <span 
                            key={i} 
                            className={`text-xs px-2.5 py-0.5 rounded-full ${
                              ['Fellation', 'Sodomie', 'BDSM', '69', 'Trio', 'Levrette', 'Amazone', 'Cowgirl', 'Soumise', 'Dominatrice', 'Lingerie', 'Exhib', 'Sexting', 'Plan cam', 'Préliminaires', 'Sextoy', 'Massage'].includes(tag) 
                                ? 'bg-pink-100 text-pink-800 font-medium' 
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                        {selectedProfil.tags.length > 8 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                            +{selectedProfil.tags.length - 8}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500">Touchez pour ajouter des activités</span>
                    )}
                  </div>
                </div>
              </div>
               
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Stats</h3>
                <div className="space-y-3">
                  {Object.entries(selectedProfil.stats).map(([stat, value]) => (
                    <div key={stat} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="capitalize">{stat}</span>
                        <span>{value}/100</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={value} 
                        onChange={(e) => updateProfileNestedField(
                          selectedProfil.id, 
                          'stats', 
                          stat, 
                          parseInt(e.target.value)
                        )}
                        className="w-full accent-zinc-600"
                        title={`Ajuster ${stat}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
               
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Description</h3>
                {editingField === 'description' ? (
                  <textarea 
                    id={`profil-description-${selectedProfil.id}`}
                    name={`profil-description-${selectedProfil.id}`}
                    className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-zinc-300 text-sm"
                    value={selectedProfil.description}
                    onChange={(e) => updateProfileField(selectedProfil.id, 'description', e.target.value)}
                    rows={4}
                    autoFocus
                    onBlur={() => setEditingField(null)}
                    placeholder="Ajoutez une description..."
                    title="Modifier la description"
                  />
                ) : (
                  <div 
                    className="p-3 border rounded bg-gray-50 text-sm cursor-pointer"
                    onClick={() => toggleEditField('description')}
                  >
                    {selectedProfil.description || "Ajoutez une description..."}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modales d'export/import */}
      {showExportModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black/80 z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              toggleExportModal();
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium">Exporter vos profils</h3>
              <button 
                onClick={toggleExportModal}
                className="text-gray-400 hover:text-gray-600"
                title="Fermer"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">Téléchargez toutes vos profils dans un fichier JSON.</p>
            
            <div className="mb-4 p-4 border border-dashed border-gray-300 rounded-lg text-center">
              <div className="cursor-pointer flex flex-col items-center">
                <Download size={24} className="text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Cliquez sur Exporter pour télécharger vos données</span>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <button 
                onClick={toggleExportModal}
                className="px-4 py-2 border border-zinc-300 rounded-md text-sm"
                title="Annuler"
              >
                Annuler
              </button>
              <button 
                onClick={exportData}
                className="px-4 py-2 border border-zinc-300 rounded-md text-sm"
                title="Exporter"
              >
                Exporter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'import */}
      {showImportModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black/80 z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              toggleImportModal();
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium">Importer des profils</h3>
              <button 
                onClick={toggleImportModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">Chargez vos profils depuis un fichier JSON, CSV ou Excel.</p>
            
            <div className="mb-4 p-4 border border-dashed border-gray-300 rounded-lg text-center">
              <label htmlFor="import-file" className="cursor-pointer flex flex-col items-center">
                <Upload size={24} className="text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Cliquez pour sélectionner un fichier</span>
                <input 
                  id="import-file"
                  name="import-file"
                  type="file"
                  accept=".json,.csv,.xlsx"
                  onChange={importData}
                  className="hidden"
                />
              </label>
            </div>
            
            <div className="flex justify-end">
              <button 
                onClick={toggleImportModal}
                className="px-4 py-2 border border-zinc-300 rounded-md text-sm"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour ajouter un nouveau Profil */}
      {showAddForm && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black/80 z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddForm(false);
            }
          }}
        >
          <div 
            className="bg-white rounded-lg shadow-lg w-full max-w-sm p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium">Ajouter un nouveau profil</h3>
              <button 
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
                title="Fermer"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="flex justify-center my-8">
              <div className="w-24 h-24 bg-gray-100 rounded-full relative group">
                {/* Structure complètement hermétique et isolée */}
                <div className="absolute inset-0 rounded-full shadow-lg overflow-hidden z-50 isolate flex items-center justify-center" style={{ 
                  boxShadow: 'none',
                  border: 'none',
                  cursor: isDragging ? 'grabbing' : 'grab'
                }}>
                  {/* Fond blanc de base */}
                  <div className="absolute inset-0 bg-white/70"></div>
                  
                  {/* Image de profil avec priorité maximale et isolation */}
                  <div 
                    className="absolute inset-0 z-20 isolate"
                    style={{
                      backgroundImage: 'none',
                      backgroundPosition: 'center',
                      backgroundSize: 'cover'
                    }}
                  >
                    {/* Afficher l'initiale seulement si pas d'image */}
                    <div className="w-full h-full flex items-center justify-center group">
                      <span className="text-xl text-gray-600 group-hover:opacity-0 transition-opacity">+</span>
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Camera size={24} />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Le bouton upload avec une meilleure visibilité */}
                <div className="absolute inset-0" style={{ zIndex: 100 }}>
                  <input 
                    type="file" 
                    id="add-profile-upload"
                    accept="image/*,.gif" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    style={{ zIndex: 50 }}
                    onChange={(e) => handleImageUpload(e)} 
                  />
                  <label 
                    htmlFor="add-profile-upload" 
                    className="block w-full h-full rounded-full cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-transparent group-hover:bg-black/30 text-white rounded-full flex flex-col items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                      <Camera size={24} />
                    </div>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={handleNewProfile}
                className="w-full py-2.5 border border-gray-300 rounded-md text-center text-gray-700 hover:bg-gray-50"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barre de navigation */}
      <div className="bg-white shadow-md border-t border-stone-200 py-2 sticky bottom-0 z-10">
        <div className="flex justify-around">
          <button 
            className={`flex flex-col items-center justify-center px-3 py-1 ${activeTab === 'home' ? 'text-zinc-800' : 'text-zinc-400'}`}
            onClick={() => setActiveTab('home')}
          >
            <Shield size={22} />
            <span className="text-[10px] mt-1">Collection</span>
          </button>
          <button 
            className={`flex flex-col items-center justify-center px-3 py-1 ${activeTab === 'favorites' ? 'text-zinc-800' : 'text-zinc-400'}`}
            onClick={() => setActiveTab('favorites')}
          >
            <Star size={22} />
            <span className="text-[10px] mt-1">Favoris</span>
          </button>
          <button 
            className="flex flex-col items-center justify-center px-3 py-1 bg-zinc-800 text-white rounded-full -mt-4 w-14 h-14 shadow-md border-4 border-white"
            onClick={toggleAddForm}
          >
            <Plus size={22} />
          </button>
          <button 
            className={`flex flex-col items-center justify-center px-3 py-1 ${activeTab === 'battles' ? 'text-zinc-800' : 'text-zinc-400'}`}
            onClick={() => setActiveTab('battles')}
          >
            <Map size={22} />
            <span className="text-[10px] mt-1">Carte</span>
          </button>
          <div className="flex flex-col items-center">
            <div className="flex">
              <button 
                onClick={toggleImportModal} 
                className={`flex items-center justify-center px-2 py-1 ${activeTab === 'import' ? 'text-zinc-800' : 'text-zinc-400'}`}
                title="Importer des données"
              >
                <Download size={22} />
              </button>
              <button 
                onClick={toggleExportModal} 
                className={`flex items-center justify-center px-2 py-1 ${activeTab === 'export' ? 'text-zinc-800' : 'text-zinc-400'}`}
                title="Exporter les données"
              >
                <Upload size={22} />
              </button>
            </div>
            <span className="text-[10px] text-zinc-500">Données</span>
          </div>
        </div>
      </div>

      {/* Overlay pour fermer le menu d'édition des tags en cliquant ailleurs */}
      {editingField === 'tags' && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setEditingField(null)}
        ></div>
      )}

      {/* Modal pour la sélection des tags */}
      {showTagsModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeTagsModal();
            }
          }}
        >
          {/* Arrière-plan opaque solide */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={(e) => e.stopPropagation()}
          ></div>
          
          <div className="bg-white/95 rounded-lg shadow-xl w-full max-w-md relative z-10 max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-sm z-10">
              <h3 className="text-lg font-medium">Activités</h3>
              <button 
                onClick={closeTagsModal}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-auto p-4 space-y-6">
              {Object.entries(tagCategories).map(([category, tags]) => (
                <div key={category}>
                  <h4 className="font-medium text-gray-700 mb-2">{category}</h4>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <button
                        key={tag}
                        className={`px-3 py-2 rounded-full text-sm transition-colors ${
                          tempSelectedTags.includes(tag)
                            ? ['Fellation', 'Sodomie', 'BDSM', '69', 'Trio', 'Levrette', 'Amazone', 'Cowgirl', 'Soumise', 'Dominatrice', 'Lingerie', 'Exhib', 'Sexting', 'Plan cam', 'Préliminaires', 'Sextoy', 'Massage'].includes(tag) 
                              ? 'bg-pink-500 text-white font-medium' 
                              : 'bg-zinc-700 text-white font-medium'
                            : ['Fellation', 'Sodomie', 'BDSM', '69', 'Trio', 'Levrette', 'Amazone', 'Cowgirl', 'Soumise', 'Dominatrice', 'Lingerie', 'Exhib', 'Sexting', 'Plan cam', 'Préliminaires', 'Sextoy', 'Massage'].includes(tag)
                              ? 'bg-pink-100 text-pink-800 hover:bg-pink-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t sticky bottom-0 bg-white/90 backdrop-blur-sm shadow-md">
              <button 
                onClick={saveSelectedTags}
                className="w-full py-2.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium transition-colors flex items-center justify-center"
              >
                <Check size={16} className="mr-2" />
                Valider ({tempSelectedTags.length})
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Ajout du modal pour l'éditeur d'image */}
      {isEditingImage && imageToEdit && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-[100]"
          onClick={closeImageEditor}
        >
          <div 
            className="bg-white rounded-xl shadow-xl w-[400px]" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-5 pt-5 pb-3">
              <h3 className="text-lg font-medium">Ajuster votre photo</h3>
              <button 
                onClick={closeImageEditor}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Conteneur principal centré */}
            <div className="flex justify-center px-5 mb-3">
              {/* Cercle parfait avec dimensions fixes */}
              <div 
                style={{
                  width: '240px',
                  height: '240px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  position: 'relative',
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
                  cursor: isDragging ? 'grabbing' : 'grab'
                }}
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
              >
                {/* Image avec transformations */}
                <div
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url(${imageToEdit})`,
                    backgroundPosition: `calc(50% + ${imagePosition.x}%) calc(50% + ${imagePosition.y}%)`,
                    backgroundSize: `${zoomFactor * 100}%`,
                    backgroundRepeat: 'no-repeat'
                  }}
                  id="image-editor-preview"
                ></div>
              </div>
            </div>

            <div className="text-center text-sm text-gray-500 px-5 mb-5">
              Faites glisser l'image pour la repositionner
            </div>
            
            {/* Contrôles de zoom */}
            <div className="flex flex-col items-center gap-2 mt-2">
              <div className="flex items-center gap-2 w-full px-4">
                <Minus size={16} className="text-gray-500" />
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.05"
                  value={zoomFactor}
                  onChange={(e) => setZoomFactor(parseFloat(e.target.value))}
                  className="w-full accent-zinc-600"
                />
                <Plus size={16} className="text-gray-500" />
              </div>
              <div className="text-sm font-medium">
                Zoom: {Math.round((zoomFactor - 1) / 4 * 100)}%
              </div>
            </div>
            
            {/* Boutons d'action */}
            <div className="flex border-t border-gray-200">
              <button
                onClick={closeImageEditor}
                className="flex-1 py-3 text-gray-700 text-sm hover:bg-gray-50 border-r border-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={saveEditedImage}
                className="flex-1 py-3 text-blue-600 font-medium text-sm hover:bg-blue-50"
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function Page() {
  return <RoisDeLaBZ />;
}