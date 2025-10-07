"use server";
import { loginSchema, registerSchema } from "@/lib/zod";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import z from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { QuestionType } from "@prisma/client";

const baseQuestions = [
  {
    key: "fav_element",
    order: 1,
    title: "¿Qué elemento de la canción te gustó más?",
    titleEn: "Which element of the song did you like the most?",
    titleFr: "Quel élément de la chanson as-tu le plus aimé ?",
    type: QuestionType.MULTIPLE_CHOICE,
    options: [
      { value: "melodia", label: "Melodía", labelEn: "Melody", labelFr: "Mélodie" },
      { value: "letra", label: "Letra", labelEn: "Lyrics", labelFr: "Paroles" },
      { value: "voz", label: "Voz", labelEn: "Voice", labelFr: "Voix" },
      { value: "ritmo", label: "Ritmo", labelEn: "Rhythm", labelFr: "Rythme" },
      { value: "produccion", label: "Producción / mezcla", labelEn: "Production / Mix", labelFr: "Production / Mixage" },
    ],
  },
  {
    key: "mix_quality",
    order: 2,
    title: "¿Cómo calificarías la calidad de la mezcla y el sonido?",
    titleEn: "How would you rate the quality of the mix and sound?",
    titleFr: "Comment évaluerais-tu la qualité du mixage et du son ?",
    type: QuestionType.SCALE_1_5,
  },
  {
    key: "originalidad",
    order: 3,
    title: "¿Qué tan original percibes esta canción en comparación con otras del mismo género?",
    titleEn: "How original do you find this song compared to others in the same genre?",
    titleFr: "À quel point trouves-tu cette chanson originale par rapport aux autres du même genre ?",
    type:  QuestionType.SCALE_1_5,
  },
  {
    key: "playlist",
    order: 4,
    title: "¿Agregarías esta canción a alguna de tus playlists?",
    titleEn: "Would you add this song to any of your playlists?",
    titleFr: "Ajouterais-tu cette chanson à l'une de tes playlists ?",
    type:  QuestionType.MULTIPLE_CHOICE,
    options: [
      { value: "gym", label: "Para entrenar", labelEn: "For working out", labelFr: "Pour m'entraîner" },
      { value: "relax", label: "Para relajarme", labelEn: "For relaxing", labelFr: "Pour me détendre" },
      { value: "work", label: "Para trabajar / estudiar", labelEn: "For working / studying", labelFr: "Pour travailler / étudier" },
      { value: "party", label: "Para fiesta", labelEn: "For partying", labelFr: "Pour faire la fête" },
      { value: "no", label: "No la incluiría", labelEn: "I would not include it", labelFr: "Je ne l'inclurais pas" },
    ],
  },
  {
    key: "calificacion",
    order: 5,
    title: "¿Qué calificación le das a la canción en general?",
    titleEn: "What rating would you give the song overall?",
    titleFr: "Quelle note donnerais-tu à la chanson en général ?",
    type:  QuestionType.SCALE_1_5,
  },
  {
    key: "comentario",
    order: 6,
    title: "Comentario libre",
    titleEn: "Free comment",
    titleFr: "Commentaire libre",
    type:  QuestionType.TEXT,
  },
];

export const loginaction = async (values: z.infer<typeof loginSchema>) => {
  try {
    // Auth.js v5: si credenciales inválidas, lanza AuthError
    await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false, // controlamos el flujo desde el cliente
    });

    // Si no lanzó, es éxito
    return { success: true, url: "/dashboard" };
  } catch (err) {
    if (err instanceof AuthError) {
      // No dependas de err.cause?.err?.message (suele ser undefined)
      const msg =
        err.type === "CredentialsSignin"
          ? "Credenciales inválidas"
          : "No se pudo iniciar sesión";
      return { success: false, error: msg };
    }
    return { success: false, error: "Error al iniciar sesión" };
  }
};

export const registeraction = async (
  values: z.infer<typeof registerSchema>
): Promise<{ success?: boolean; error?: string; url?: string }> => {
  try {
    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      return { error: "Invalid data" };
    }
    const data = parsed.data;

    // Verificar si ya existe el usuario
    const existingUser = await db.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      return { error: "Email already registered" };
    }

    // Hashear password
    const passwordhash = await bcrypt.hash(data.password, 10);

    // Crear usuario
    const newUser = await db.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: passwordhash,
      },
    });

    // ✅ Crear preguntas base solo si no existen
    for (const q of baseQuestions) {
      const existingQ = await db.question.findFirst({
        where: { key: q.key, userId: newUser.id },
      });

      if (!existingQ) {
        const createdQ = await db.question.create({
          data: {
            key: q.key,
            order: q.order,
            title: q.title,
            titleEn: q.titleEn,
            titleFr: q.titleFr,
            type: q.type,
            userId: newUser.id,
          },
        });

        // ✅ Insertar opciones en lote
        if (q.options && q.options.length > 0) {
          await db.questionOption.createMany({
            data: q.options.map((opt) => ({
              questionId: createdQ.id,
              value: opt.value,
              label: opt.label,
              labelEn: opt.labelEn,
              labelFr: opt.labelFr,
            })),
          });
        }
      }
    }

    // ✅ Login inmediato
    const res = await signIn("credentials", {
      email: data.email,
      password: data.password, // texto plano
      redirect: false,
    });

    if (res?.error) {
      return { error: res.error };
    }

    return { success: true, url: res?.url ?? "/dashboard" };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: error.message ?? "Auth error" };
    }
    console.error("Register error:", error);
    return { error: "Unexpected error" };
  }
};

