// components/auth/SignUpForm.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card, CardHeader } from "@mui/material";

import { useTranslation } from "react-i18next";
import Link from "next/link";

const currentYear = new Date().getFullYear();

const FormSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  birthYear: z.coerce.number().int()
    .min(1900, "Año inválido")
    .max(currentYear - 18, "Debes tener al menos 18 años"),
  idPais: z.coerce.number().min(1, "Selecciona un país"),
  idCiudad: z.coerce.number().min(1, "Selecciona una ciudad"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  confirmPassword: z.string().min(1, "Confirma tu contraseña"),
}).refine((d) => d.password === d.confirmPassword, {
  path: ["confirmPassword"],
  message: "Las contraseñas no coinciden",
});

export default function SignUpForm() {
  const [paises, setPaises] = useState([]);           
  const [ciudades, setCiudades] = useState([]);       
  const [qPais, setQPais] = useState("");
  const [qCiudad, setQCiudad] = useState("");
  const [loadingPaises, setLoadingPaises] = useState(false);
  const [loadingCiudades, setLoadingCiudades] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverMsg, setServerMsg] = useState("");
  const router = useRouter();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);


  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      email: "",
      birthYear: "",
      idPais: 0,
      idCiudad: 0,
      password: "",
      confirmPassword: "",
    },
  });
  const birthYear = form.watch("birthYear");
  // Edad calculada
  const edad = useMemo(() => {
    const by = Number(birthYear);
    return by ? currentYear - by : "";
  }, [birthYear]);

  // Cargar países
  useEffect(() => {
    (async () => {
      try {
        setLoadingPaises(true);
        const res = await fetch("/api/paises");
        const data = await res.json();
        setPaises(Array.isArray(data) ? data : data.items || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingPaises(false);
      }
    })();
  }, []);

  // Cargar ciudades al cambiar país
  useEffect(() => {
    const paisId = Number(form.watch("idPais"));
    if (!paisId) {
      setCiudades([]);
      form.setValue("idCiudad", 0);
      return;
    }
    (async () => {
      try {
        setLoadingCiudades(true);
        const res = await fetch(`/api/ciudad/${paisId}`);
        const data = await res.json();
        setCiudades(Array.isArray(data) ? data : data.items || []);
        form.setValue("idCiudad", 0); // resetea selección de ciudad
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingCiudades(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch("idPais")]);

  // Filtrado de opciones
  const filteredPaises = useMemo(() => {
    const q = qPais.trim().toLowerCase();
    if (!q) return paises;
    return paises.filter((p) => p.nombre?.toLowerCase().includes(q));
  }, [paises, qPais]);

  const filteredCiudades = useMemo(() => {
    const q = qCiudad.trim().toLowerCase();
    if (!q) return ciudades;
    return ciudades.filter((c) => c.nombre?.toLowerCase().includes(q));
  }, [ciudades, qCiudad]);

  async function onSubmit(values) {
    setServerMsg("");
    setSubmitting(true);
    try {
      const payload = {
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        nacimiento: values.birthYear,
        idPais: Number(values.idPais),
        idCiudad: Number(values.idCiudad),
      };

      const res = await fetch("/api/registrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 409) {
        form.setError("email", { message: "Correo ya registrado" });
        setServerMsg("Ese correo ya está registrado.");
        return;
      }
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.message || "Error en el registro");
      }

      setServerMsg("¡Usuario creado! Revisa tu correo para confirmar.");
      form.reset();
      setQPais("");
      setQCiudad("");
      router.push('/login');
    } catch (err) {
      console.error(err);
      setServerMsg(err?.message || "Error en el servidor");
    } finally {
      setSubmitting(false);
    }
  }

  // Helpers para mostrar el label seleccionado por id
  const paisById = (id) => paises.find((p) => p.id === Number(id));
  const ciudadById = (id) => ciudades.find((c) => c.id === Number(id));
  useEffect(() => {      
      setMounted(true);
    }, []);
  if (!mounted) return null;
  return (
    <Card className="p-8">
      <h1 className="text-purple-700 text-3xl text-center mb-3">
        {t("register")}
      </h1>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-2xl mx-auto space-y-6">
        {/* Nombre */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("namelbl")}</FormLabel>
              <FormControl>
                <Input placeholder={t("namedesc")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("email")}</FormLabel>
              <FormControl>
                <Input type="email" placeholder="mail@ejemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Año de nacimiento + Edad */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="birthYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("birthdateyear")}</FormLabel>
                <FormControl>
                  <Input type="number" min={1900} max={currentYear - 18} placeholder={t("birthdateyear")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="pt-7 text-sm text-pink-600">
            {edad ? (t("calcage")+`: ${edad}`) : t("borthdatedesc")}
          </div>
        </div>

        {/* País (Combobox) */}
        <FormField
          control={form.control}
          name="idPais"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("paislbl")}</FormLabel>
              <FormControl>
                <div className="relative">
                  <Combobox
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                    disabled={loadingPaises}
                  >
                    <div className="relative">
                      <ComboboxInput
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        displayValue={(val) => (paisById(val)?.nombre || "")}
                        onChange={(e) => setQPais(e.target.value)}
                        placeholder="Selecciona un país…"
                      />
                      {/* Lista */}
                      {filteredPaises.length > 0 && (
                        <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white p-1 shadow-lg">
                          {filteredPaises.map((p) => (
                            <ComboboxOption
                              key={p.id}
                              value={p.id}
                              className={({ active }) =>
                                `cursor-pointer select-none rounded px-3 py-2 text-sm ${
                                  active ? "bg-primary/10 text-gray-900" : "text-gray-700"
                                }`
                              }
                            >
                              {p.nombre}
                            </ComboboxOption>
                          ))}
                        </ComboboxOptions>
                      )}
                      {/* Vacío */}
                      {qPais && filteredPaises.length === 0 && (
                        <div className="absolute mt-1 w-full rounded-md border bg-white p-2 text-sm text-gray-500">
                          Sin resultados
                        </div>
                      )}
                    </div>
                  </Combobox>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Ciudad (Combobox dependiente) */}
        <FormField
          control={form.control}
          name="idCiudad"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("citylbl")}</FormLabel>
              <FormControl>
                <div className="relative">
                  <Combobox
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                    disabled={loadingCiudades || !form.watch("idPais")}
                  >
                    <div className="relative">
                      <ComboboxInput
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60"
                        displayValue={(val) => (ciudadById(val)?.nombre || "")}
                        onChange={(e) => setQCiudad(e.target.value)}
                        placeholder={
                          form.watch("idPais") ? t("selcity") : t("nocity")
                        }
                        disabled={!form.watch("idPais")}
                      />
                      {filteredCiudades.length > 0 && (
                        <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white p-1 shadow-lg">
                          {filteredCiudades.map((c) => (
                            <ComboboxOption
                              key={c.id}
                              value={c.id}
                              className={({ active }) =>
                                `cursor-pointer select-none rounded px-3 py-2 text-sm ${
                                  active ? "bg-primary/10 text-gray-900" : "text-gray-700"
                                }`
                              }
                            >
                              {c.nombre}
                            </ComboboxOption>
                          ))}
                        </ComboboxOptions>
                      )}
                      {qCiudad && filteredCiudades.length === 0 && (
                        <div className="absolute mt-1 w-full rounded-md border bg-white p-2 text-sm text-gray-500">
                          {t("nodatarep")}
                        </div>
                      )}
                    </div>
                  </Combobox>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password + Confirm */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("password")}</FormLabel>
                <FormControl>
                  <Input type="password" placeholder={t("clavedesc")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("confirmpass")}</FormLabel>
                <FormControl>
                  <Input type="password" placeholder={t("confirmdesc")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Mensaje del servidor / Submit */}
        {serverMsg && <div className="text-sm text-gray-700">{serverMsg}</div>}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Enviando..." : "Crear cuenta"}
        </Button>
      </form>
    </Form>
    <p className="text-center text-sm text-gray-600 mt-2">
                    {t("account")} &nbsp;
                    <Link className="text-blue-500 hover:underline" href="/register">
                      {t("signin")}
                    </Link>
                  </p>
    </Card>
  );
}
