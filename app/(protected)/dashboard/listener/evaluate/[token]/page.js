"use client";
import * as React from 'react';
import { useEffect, useState } from "react";
import EvaluateClient from "@/components/EvaluateClient";
import Snackbar from '@mui/material/Snackbar';

export default function EvaluatePage({ params }) {
  const [data, setData] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openError, setOpenError] = useState(false);
  const [token, setToken] = useState(""); // ✅ siempre tener token en estado

  // 1️⃣ Resolver token desde params apenas cargue el componente
  useEffect(() => {
    async function resolveParams() {
      const resolved = await params;
      setToken(resolved.token || "");
    }
    resolveParams();
  }, [params]);

  // 2️⃣ Obtener sesión en cliente
  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const json = await res.json();
          setSession(json);
        }
      } catch (err) {
        console.error("Error obteniendo sesión:", err);
      }
    }
    fetchSession();
  }, []);

  // 3️⃣ Cargar datos de evaluación usando token
  useEffect(() => {
    if (!token) return; // ⏳ Esperar a tener token
    async function fetchData() {
      try {
        const res = await fetch(`/api/listener/evaluate/${token}`);
        if (!res.ok) throw new Error("Error al cargar datos");
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
        setOpenError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [token]);
   const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };


  if (loading && !data) return <div>Cargando...</div>;

  return (
    <>
      {openError && <Snackbar
        open={openError}
        autoHideDuration={10000}
        onClose={handleClose}
        message={error}
      />}

      {/* 🔑 Siempre pasamos token como prop */}
      <EvaluateClient
        token={token}
        data={data}
        session={session}
        onError={(msg) => {
          setError(msg);
          setOpenError(true);
        }}
      />
    </>
  );
}
