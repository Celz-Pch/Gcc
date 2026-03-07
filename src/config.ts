export interface Subject {
    name: string
    description: string
    files: string[]
    difficulty: 'Débutant' | 'Intermédiaire' | 'Avancé'
    tags: string[]
    isNew?: boolean
}

export interface Session {
    title: string
    date: string
    location: string
    description: string
}

export const session: Session = {
    title: 'Coding Club',
    date: 'Samedi 8 Mars 2026',
    location: 'Epitech — Le Hub',
    description: 'Bienvenue au Coding Club ! Retrouvez ici les ressources et sujets de la session.'
}

export const subjects: Subject[] = [
    {
        name: 'Mycépaint',
        description: 'Projet Python/Pygame consistant à créer un logiciel de dessin. Au service du roi Weegee, vous développez une application permettant de tracer des lignes à la souris, de remplir des zones avec de la couleur (bucket fill) et d\'effacer le canvas. Le projet introduit la gestion de fenêtre, la boucle d\'événements, la détection des entrées souris/clavier et les fonctions de dessin de Pygame.',
        files: ['Mycepaint_2026.pdf'],
        difficulty: 'Intermédiaire',
        tags: ['Python', 'Pygame']
    },
    {
        name: 'Paperclip Factory',
        description: 'Projet HTML/CSS/JavaScript inspiré du jeu mythique Universal Paperclips (Frank Lantz, 2017). Tu vas recréer les bases d\'un idle game en construisant une usine à trombones interactive sur JSFiddle. Au programme : structurer une page avec HTML, la styliser avec CSS, puis lui donner vie en JavaScript — variables, getElementById, addEventListener, setInterval et conditions. À la fin, ton usine fabrique des trombones au clic, gère un stock, vend automatiquement et ajuste son prix de vente.',
        files: ['Paperclip_Factory.pdf'],
        difficulty: 'Débutant',
        tags: ['HTML', 'CSS', 'JavaScript'],
        isNew: true
    }
]
