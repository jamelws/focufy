"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Box, Typography, TextField, Button, MenuItem, Snackbar, Alert,
} from "@mui/material";

export default function EditFocusGroup({ params }) {
  // 🔹 Desempaquetar con React.use()
  const { id } = use(params);

  const router = useRouter();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [emails, setEmails] = useState("");
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const res = await fetch(`/api/artist/focusgroups/${id}`);
        if (!res.ok) throw new Error("No se pudo cargar el grupo");

        const fg = await res.json();
        setNombre(fg.nombre || "");

        const selectedFromMembers = (fg.PullUsers || [])
          .map((m) => m.user?.id)
          .filter(Boolean);
        setSelectedUsers(selectedFromMembers);

        const emailsFromMembers = (fg.PullUsers || [])
          .map((m) => m.correo)
          .filter(Boolean)
          .join(", ");
        setEmails(emailsFromMembers);

        const resUsers = await fetch(`/api/user`);
        if (!resUsers.ok) throw new Error("Error al cargar usuarios");
        setUsers(await resUsers.json());
      } catch (e) {
        console.error(e);
        setSnack({ open: true, msg: e.message, sev: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const save = async () => {
    try {
      const res = await fetch(`/api/artist/focusgroups/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, userIds: selectedUsers, emails }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");

      setSnack({ open: true, msg: t("savedtext"), sev: "success" });
      router.push("/dashboard/artist/focusgroups");
    } catch (e) {
      setSnack({ open: true, msg: e.message, sev: "error" });
    }
  };

  if (loading) {
    return <Box p={3}><Typography>{t("loading")}</Typography></Box>;
  }

  return (
    <Box p={3} maxWidth={720} mx="auto">
      <Typography variant="h5" mb={2}>
        {t("editfg")} #{id}
      </Typography>

      <TextField
        label={t("namelbl")}
        fullWidth
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        sx={{ mb: 2 }}
      />

      <TextField
        select
        label={t("reguserslbl")}
        value={selectedUsers}
        onChange={(e) =>
          setSelectedUsers(
            typeof e.target.value === "string"
              ? e.target.value.split(",")
              : e.target.value
          )
        }
        fullWidth
        multiple
        sx={{ mb: 2 }}
      >
        {users.map((u) => (
          <MenuItem key={u.id} value={u.id}>
            {u.name || ""}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label={t("emailslbl")}
        fullWidth
        value={emails}
        onChange={(e) => setEmails(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Box display="flex" gap={1}>
        <Button
          variant="outlined"
          onClick={() => router.push("/dashboard/artist/focusgroups")}
        >
          {t("cancelbtn")}
        </Button>
        <Button variant="contained" onClick={save}>
          {t("savebtn")}
        </Button>
      </Box>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert
          severity={snack.sev}
          onClose={() => setSnack({ ...snack, open: false })}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
