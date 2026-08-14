// ── WhatsApp ──
export const WHATSAPP_NUMBER = "55XXXXXXXXXXX"; // TODO: substituir pelo número real
export const WHATSAPP_MESSAGE = "Olá! Gostaria de agendar uma consulta com a Priscila.";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

// ── Social Links ──
export const SOCIAL_LINKS = {
  instagram: "https://instagram.com/quiromais", // TODO: substituir pelo perfil real
  whatsapp: WHATSAPP_URL,
};

// ── Contact Info ──
export const CONTACT_INFO = {
  address: "Rua Exemplo, 123 — Centro, Cidade/UF", // TODO: substituir
  phone: "(XX) XXXXX-XXXX", // TODO: substituir
  hours: "Seg a Sex: 8h às 19h | Sáb: 8h às 13h", // TODO: substituir
};

// ── Nav Menu Items ──
export const NAV_CATEGORIES = [
  {
    title: "Serviços Clínicos",
    items: [
      { name: "Dores no Pescoço", href: "#servicos" },
      { name: "Hérnia de Disco", href: "#servicos" },
      { name: "Dores do Ciático", href: "#servicos" },
      { name: "Torcicolo", href: "#servicos" },
      { name: "Dores no Joelho", href: "#servicos" },
      { name: "Prevenção de Lesões", href: "#servicos" },
    ],
  },
  {
    title: "Quiropraxia Especializada",
    items: [
      { name: "Quiropraxia Esportiva", href: "#servicos" },
      { name: "Quiropraxia para Gestantes", href: "#servicos" },
      { name: "Quiropraxia para Crianças", href: "#servicos" },
      { name: "Especialista em Coluna", href: "#servicos" },
      { name: "Especialista em Dores Ciáticas", href: "#servicos" },
      { name: "Especialista em Enxaqueca", href: "#servicos" },
      { name: "Disfunções de ATM (Bruxismo)", href: "#servicos" },
    ],
  },
  {
    title: "Terapias Complementares",
    items: [
      { name: "Reflexologia Podal", href: "#servicos" },
      { name: "Auriculoterapia", href: "#servicos" },
      { name: "Dry Needling", href: "#servicos" },
      { name: "Recovery", href: "#servicos" },
    ],
  },
];

export interface ServiceDetail {
  name: string;
  description: string;
  details: string;
  benefits: string[];
  indications: string;
  icon: string;
}

export interface ServiceCategory {
  category: string;
  services: ServiceDetail[];
}

// ── Services Section Data ──
export const SERVICES_DATA: ServiceCategory[] = [
  {
    category: "Serviços Clínicos",
    services: [
      {
        name: "Dores no Pescoço",
        description: "Alívio e tratamento para dores cervicais com técnicas manuais especializadas.",
        details: "Tratamento focado na descompressão cervical, correção postural e liberação muscular do pescoço e ombros, devolvendo a mobilidade natural sem o uso de medicamentos.",
        benefits: ["Alívio rápido da rigidez cervical", "Redução da dor ao girar a cabeça", "Melhora do fluxo sanguíneo e da postura"],
        indications: "Pessoas com tensão cervical, dor ao trabalhar no computador, má postura ou torcicolo frequente.",
        icon: "neck",
      },
      {
        name: "Hérnia de Disco",
        description: "Tratamento conservador para hérnias discais com foco na recuperação funcional.",
        details: "Abordagem quiropráxica segura voltada para a descompressão das raízes nervosas acometidas por protrusões e hérnias de disco lombares ou cervicais.",
        benefits: ["Redução da compressão do disco e da dor irradiada", "Evita procedimentos invasivos e cirúrgicos", "Restauração da funcionalidade da coluna"],
        indications: "Pacientes diagnosticados com hérnia ou protrusão discal com dor, formigamento ou perda de força.",
        icon: "spine",
      },
      {
        name: "Dores do Ciático",
        description: "Descompressão e alívio da dor ciática com abordagem individualizada.",
        details: "Ajustes quiropráxicos específicos para descomprimir o nervo ciático na região lombar e do glúteo (músculo piriforme), eliminando a dor que se irradia pelas pernas.",
        benefits: ["Alívio imediato da dor que queima ou fisga na perna", "Desativação de pontos-gatilho profundos", "Melhora da caminhada e do sentar"],
        indications: "Pessoas com dores agudas ou crônicas que descem do glúteo para a perna.",
        icon: "leg",
      },
      {
        name: "Torcicolo",
        description: "Técnicas de mobilização e relaxamento para torcicolo agudo e crônico.",
        details: "Atendimento imediato e suave para torcicolo agudo, reduzindo o espasmo muscular involuntário e alinhando as vértebras cervicais travadas.",
        benefits: ["Recuperação imediata da rotação do pescoço", "Diminuição do espasmo e da inflamação local", "Prevenção de recidivas"],
        indications: "Quem acorda com o pescoço travado ou sofreu movimento brusco na região cervical.",
        icon: "twist",
      },
      {
        name: "Dores no Joelho",
        description: "Avaliação e tratamento das disfunções articulares do joelho.",
        icon: "knee",
        details: "Tratamento biomecânico que alinha quadril, joelho e tornozelo para equilibrar as cargas articulares e aliviar desgaste ou inflamações no joelho.",
        benefits: ["Alívio de dores ao subir e descer escadas", "Reequilíbrio da pisada e alinhamento patelar", "Redução do estresse sobre a patela e meniscos"],
        indications: "Praticantes de atividades físicas, idosos ou pessoas com desalinhamento postural.",
      },
      {
        name: "Prevenção de Lesões",
        description: "Programas personalizados para prevenir lesões e manter o corpo em equilíbrio.",
        icon: "shield",
        details: "Check-up postural e biomecânico completo para identificar desequilíbrios musculares antes que se transformem em dores ou lesões graves.",
        benefits: ["Manutenção da saúde articular e muscular", "Melhor alinhamento postural contínuo", "Aumento da disposição física e prevenção da dor"],
        indications: "Qualquer pessoa que busca qualidade de vida e quer evitar que dores silenciosas se agravem.",
      },
    ],
  },
  {
    category: "Quiropraxia Especializada",
    services: [
      {
        name: "Quiropraxia Esportiva",
        description: "Performance e recuperação para atletas de todos os níveis.",
        icon: "sport",
        details: "Protocolos de ajustes articulares e liberação miofascial direcionados para maximizar a amplitude de movimento, rendimento e acelerar a regeneração muscular.",
        benefits: ["Ganho imediato de amplitude de movimento", "Prevenção de estiramentos e microlesões", "Recuperação física acelerada pós-treino"],
        indications: "Atletas amadores, profissionais ou praticantes regulares de musculação e esportes.",
      },
      {
        name: "Quiropraxia para Gestantes",
        description: "Cuidado seguro e gentil para o conforto durante a gestação.",
        icon: "pregnant",
        details: "Técnicas extremamente suaves e adequadas para cada trimestre gestacional, aliviando dores lombares e pélvicas provocadas pelas mudanças do centro de gravidade.",
        benefits: ["Alívio expressivo de dores lombares e na sínfise púbica", "Preparação da pelve para o parto", "Melhora da qualidade do sono e bem-estar"],
        indications: "Gestantes em qualquer fase da gravidez com dores na coluna ou desconforto pélvico.",
      },
      {
        name: "Quiropraxia para Crianças",
        description: "Acompanhamento do desenvolvimento postural infantil com delicadeza.",
        icon: "child",
        details: "Avaliação cuidadosa e ajustes de altíssima precisão e toque suave para acompanhar o crescimento e prevenir desvios posturais e escolioses.",
        benefits: ["Correção precoce de alterações na pisada e coluna", "Acompanhamento do crescimento saudável", "Alívio de tensões do transporte de mochilas"],
        indications: "Crianças e adolescentes em fase de crescimento postural.",
      },
      {
        name: "Especialista em Coluna",
        description: "Diagnóstico e tratamento especializado em toda a extensão da coluna vertebral.",
        icon: "spine-full",
        details: "Avaliação completa de toda a coluna (cervical, torácica e lombar) com plano terapêutico personalizado focado na causa raiz dos desajustes.",
        benefits: ["Tratamento global da coluna vertebral", "Eliminação de compensações posturais", "Restauração da vitalidade e mobilidade"],
        indications: "Pessoas com dores recorrentes ou deformações posturais crônicas.",
      },
      {
        name: "Especialista em Enxaqueca",
        description: "Abordagem cervical e craniana para alívio de enxaquecas e cefaleias.",
        icon: "head",
        details: "Tratamento das subluxações cervicais altas (C1 e C2) que provocam cefaleias tensionais e aumentam a frequência das dores de cabeça.",
        benefits: ["Redução drástica na frequência e intensidade das crises", "Diminuição do uso de analgésicos", "Alívio da pressão occipital e ocular"],
        indications: "Pessoas que sofrem com dores de cabeça diárias, enxaquecas ou sensação de peso na cabeça.",
      },
      {
        name: "Disfunções de ATM",
        description: "Tratamento para bruxismo e disfunções da articulação temporomandibular.",
        icon: "jaw",
        details: "Ajuste e liberação das articulações têmporo-mandibulares e musculatura da mastigação, reduzindo estalidos, bruxismo e dores na face.",
        benefits: ["Redução de apertamento e bruxismo noturno", "Fim dos estalidos na mandíbula ao mastigar", "Alívio de dores faciais e zumbidos no ouvido"],
        indications: "Pessoas com bruxismo, apertamento dentário, dor na mandíbula ou estalidos.",
      },
    ],
  },
  {
    category: "Terapias Complementares",
    services: [
      {
        name: "Reflexologia Podal",
        description: "Estímulo de pontos reflexos nos pés para equilíbrio do corpo.",
        icon: "foot",
        details: "Aplicação de pressões específicas em zonas reflexas dos pés associadas a órgãos e sistemas, promovendo profundo relaxamento e alívio de dor.",
        benefits: ["Redução do estresse e da ansiedade", "Estímulo da circulação e drenagem nos pés", "Sensação profunda de descanso e renovação"],
        indications: "Pessoas com pés cansados, retenção de líquido, estresse alto ou insônia.",
      },
      {
        name: "Auriculoterapia",
        description: "Terapia auricular para dor, ansiedade e equilíbrio emocional.",
        icon: "ear",
        details: "Estimulação de pontos nervosos na orelha usando pequenas sementes ou esferas para modular a percepção da dor e equilibrar o sistema nervoso.",
        benefits: ["Auxílio no controle da ansiedade e compulsão", "Potencializa o efeito analgésico da quiropraxia", "Sem agulhas ou dor"],
        indications: "Pacientes buscando equilíbrio emocional, controle da ansiedade e alívio da dor crônica.",
      },
      {
        name: "Dry Needling",
        description: "Agulhamento a seco para liberação de pontos-gatilho e tensões musculares.",
        icon: "needle",
        details: "Inserção de agulhas de acupuntura em nós musculares (pontos-gatilho), inativando instantaneamente nós de tensão dolorosos.",
        benefits: ["Desativação imediata de nós de dor", "Relaxamento profundo da musculatura contraída", "Restauração da elasticidade muscular"],
        indications: "Pessoas com nós rígidos nas costas, ombros, trapézio e glúteos.",
      },
      {
        name: "Recovery",
        description: "Protocolo completo de recuperação muscular e articular pós-esforço.",
        icon: "recovery",
        details: "Combinação de bota de compressão pneumática, liberação miofascial e ventosaterapia para eliminar toxinas musculares e acelerar a regeneração.",
        benefits: ["Drenagem acelerada de metabólitos do treino", "Redução do cansaço físico muscular", "Sensação imediata de pernas leves"],
        indications: "Atletas, corredores e pessoas após esforço físico intenso.",
      },
    ],
  },
];

// ── Reviews Data ──
export const REVIEWS_DATA = [
  {
    name: "Ana Carolina S.",
    rating: 5,
    text: "A Priscila é incrível! Cheguei com uma dor terrível no pescoço e saí me sentindo outra pessoa. O atendimento é acolhedor e muito profissional.",
    date: "2 meses atrás",
  },
  {
    name: "Rafael M.",
    rating: 5,
    text: "Depois de anos sofrendo com dor ciática, finalmente encontrei um tratamento que funciona. A Quiro+ mudou minha qualidade de vida!",
    date: "3 meses atrás",
  },
  {
    name: "Juliana P.",
    rating: 5,
    text: "Fiz quiropraxia durante toda a minha gestação e foi maravilhoso. A Priscila tem um cuidado especial com gestantes. Super recomendo!",
    date: "1 mês atrás",
  },
  {
    name: "Carlos Eduardo L.",
    rating: 5,
    text: "Atendimento de excelência! A estrutura é linda e a Priscila explica tudo com muita clareza. Me sinto seguro e bem cuidado.",
    date: "2 semanas atrás",
  },
  {
    name: "Mariana F.",
    rating: 5,
    text: "Sofria com enxaquecas há anos e nenhum remédio resolvia. Após o tratamento com a Priscila, minhas crises reduziram drasticamente!",
    date: "1 mês atrás",
  },
  {
    name: "Pedro Henrique A.",
    rating: 5,
    text: "Como atleta, a quiropraxia esportiva da Quiro+ melhorou muito minha performance e recuperação. Profissional impecável!",
    date: "3 semanas atrás",
  },
];

// ── Bio Content (Quem Sou) ──
export const BIO_BLOCKS = [
  {
    title: "Muito prazer, eu sou a Priscila Santos.",
    text: "Fisioterapeuta e quiropraxista apaixonada por transformar vidas através do cuidado com o corpo. Acredito que cada pessoa merece viver sem dor e com plenitude de movimento.",
    showPhoto: true,
  },
  {
    title: "",
    text: "A fisioterapia me escolheu — e a quiropraxia completou minha missão. Ao longo dos anos, tive o privilégio de devolver qualidade de vida a centenas de pacientes, e cada história me motiva a buscar sempre o melhor.",
  },
  {
    title: "",
    text: "A Quiro+ nasceu do meu propósito de oferecer um atendimento que vai além da técnica: é sobre excelência, personalização e acolhimento. Cada detalhe foi pensado para que você se sinta cuidado desde o primeiro momento.",
  },
  {
    title: "",
    text: "Minha missão é tratar a causa, não apenas o sintoma. Respeitar a individualidade de cada corpo. Oferecer uma experiência de cuidado que transforma — não apenas alivia.",
  },
  {
    title: "",
    text: "Minha fé me sustenta, o aprendizado constante me move e a excelência é minha escolha diária. Se você chegou até aqui, seja muito bem-vindo(a) à Quiro+. Estou pronta para cuidar de você.",
  },
];
