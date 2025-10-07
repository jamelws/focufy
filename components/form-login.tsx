"use client";

import React, { useEffect, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { loginSchema } from "@/lib/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "./ui/button";

import { loginaction } from "@/actions/auth.action";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Card } from "@mui/material";

const FormLogin = () => {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  // 1. Define your form.
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setError(null);

    startTransition(async () => {
      const response = await loginaction(values);

      if (response.error) {
        setError(response.error);
      } else {
        // si el server devuelve url úsala, si no manda a dashboard
        router.push(response.url ?? "/dashboard");
      }
    });
  }
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return (
    
    <Card className="p-8 rounded-[50px]">
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Login</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("email")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder="you@example.com"
                    type="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("password")}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="********"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* error del servidor */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "..." : t("signin")}
          </Button>
        </form>
      </Form>
      <p className="text-center text-sm text-gray-600 mt-2">
        {t("noAccount")} &nbsp;
        <Link className="text-blue-500 hover:underline" href="/register">
          {t("signup")}
        </Link>
      </p>
    </div></Card>
    
  );
};

export default FormLogin;
