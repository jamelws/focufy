"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Stack,
  Chip,
  Snackbar,
  Alert,
  Container
} from "@mui/material";
import { useTranslation } from "react-i18next";
export default function FocusGroupsClient() {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });
  const { t, i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);

  const loadGroups = useCallback(async () => {
    try {
      const res = await fetch("/api/artist/focusgroups");
      if (!res.ok) throw new Error(t("err_get_groups") || "Error al obtener grupos");
      const data = await res.json();
      setGroups(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setSnack({ open: true, msg: e.message || "Error al cargar", sev: "error" });
    } finally {
      setLoading(false);
    }
   }, [t]);

  useEffect(() => {
    loadGroups();
    setMounted(true);
  }, [loadGroups]);

  const handleDelete = async (id) => {
    if (!confirm(t("confdelfg"))) return;
    try {
      // Si tu API usa segmento dinámico [id]:
      const res = await fetch(`/api/artist/focusgroups/${id}`, { method: "DELETE" });

      // Si tu API usa query param ?id=:
      // const res = await fetch(`/api/artist/focusgroups?id=${id}`, { method: "DELETE" });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || t("err_delete_fg") || "Error al eliminar");

      setGroups((prev) => prev.filter((g) => g.id !== id));
      setSnack({ open: true, msg: t("fgdeleted"), sev: "success" });
    } catch (e) {
      setSnack({ open: true, msg: e.message || "Error", sev: "error" });
    }
  };
  if (!mounted) return null;

    return (
        <Container>
            <Box p={3}>
      <Typography variant="h4" gutterBottom>
        {t("fgtitle")}
      </Typography>

      <Box mb={2}>
        <Button variant="contained" component={Link} 
	  href="/dashboard/artist/focusgroups/create">
          {t("fgnew")}
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "grid", placeItems: "center", minHeight: 160 }}>
          <CircularProgress />
        </Box>
      ) : groups.length === 0 ? (
        <Typography>{t("nofg")}</Typography>
      ) : (
        <Box
          display="grid"
          gridTemplateColumns="repeat(auto-fill, minmax(280px, 1fr))"
          gap={2}
        >
          {groups.map((g) => {
            const membersCount =
              (g && g._count && typeof g._count.PullUsers === "number")
                ? g._count.PullUsers
                : Array.isArray(g?.PullUsers) ? g.PullUsers.length : 0;

            const tokensCount =
              (g && g._count && typeof g._count.ShareTokens === "number")
                ? g._count.ShareTokens
                : 0;

            return (
              <Card
                key={g.id}
                sx={{
                  p: 2,
                  bgcolor: "#fff",
                  borderRadius: 2,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {g.nombre}{" "}
                    <Typography component="span" variant="body2" color="text.secondary">
                      #{g.id}
                    </Typography>
                  </Typography>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {/* Corrige la key si tu i18n usa otra: "createdtext" vs "creratedtext" */}
                    {t("createdtext")}:{" "}
                    {g.createdAt
                      ? new Date(g.createdAt).toLocaleString(i18n.language || undefined)
                      : "—"}
                  </Typography>

                  <Divider sx={{ my: 1.5 }} />

                  <Stack direction="row" spacing={1} mb={1} flexWrap="wrap">
                    <Chip label={`${t("memberslbl")}: ${membersCount}`} />
                    <Chip label={`${t("tokenslbl")}: ${tokensCount}`} />
                  </Stack>

                  <Box mt={1}>
                    {!g?.PullUsers || g.PullUsers.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        {t("no_members") || "Sin miembros"}
                      </Typography>
                    ) : (
                      <Stack spacing={0.75}>
                        {g.PullUsers.map((m) => {
                          const display = (m && m.user && m.user.email) || m?.correo || "—";
                          const secondary =
                            (m && m.user && m.user.email)
                              ? (t("reguserslbl") || "Usuario registrado")
                              : (m && m.correo)
                              ? (t("invited_by_email") || "Invitado por correo")
                              : "";
                          return (
                            <Box key={m.id}>
                              <Typography variant="body2">{display}</Typography>
                              {secondary && (
                                <Typography variant="caption" color="text.secondary">
                                  {secondary}
                                </Typography>
                              )}
                            </Box>
                          );
                        })}
                      </Stack>
                    )}
                  </Box>

                  {/* Acciones */}
                  <Box mt={2} display="flex" gap={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      component={Link}
                      href={`/dashboard/artist/focusgroups/${g.id}`}
                    >
                      {t("edit") || "Editar"}
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleDelete(g.id)}
                    >
                      {t("delete") || "Eliminar"}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      >
        <Alert
          severity={snack.sev}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          variant="filled"
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
        </Container>
    );
}
