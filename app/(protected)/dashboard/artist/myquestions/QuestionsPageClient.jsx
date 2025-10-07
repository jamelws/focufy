"use client";

import React, { useState, useEffect, Fragment } from "react";
import { useTranslation } from "react-i18next";

// ==============================
// Fila de Pregunta (expandible)
// ==============================
function QuestionRow({ question, onEdit, onDelete, onOptionEdit, onOptionDelete, onOptionNew }) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <Fragment>
      {/* Fila Maestra */}
      <tr className="bg-gradient-to-r">
        <td className="px-4 py-2 w-10">
          {question.type === "MULTIPLE_CHOICE" && (
            <button
             
              onClick={() => setOpen(!open)}
            >
              {open ? "▲" : "▼"}
            </button>
          )}
        </td>
        <td className="px-4 py-2">{question.key}</td>
        <td className="px-4 py-2">
          <b>🇪🇸:</b> {question.title}
          <br />
          <b>🇺🇸:</b> {question.titleEn}
          <br />
          <b>🇫🇷:</b> {question.titleFr}
        </td>
        <td className="px-4 py-2">{question.type}</td>
        <td className="px-4 py-2">
          <button
            onClick={() => onEdit(question)}
            className="px-2 py-1 bg-purple-800 rounded-2xl text-white"
          >
            ✎
          </button>
          <button
            onClick={() => onDelete(question.id)}
            className="px-2 py-1 bg-purple-800 rounded-2x1 text-white"
          >
            🗑
          </button>
        </td>
      </tr>

      {/* Opciones */}
      {open && (
        <tr>
          <td colSpan={5} className="px-6 py-4 bg-purple-200">
            <button
              onClick={() => onOptionNew(question.id)}
              className="mt-2 px-3 py-1 border rounded float-end"
            >
              {t("addoption")}
            </button>
            <table className="w-full border text-sm">
              <thead>
                <tr className="bg-purple-800 text-white">
                  <th className="px-2 py-1">{t("orderlbl")}</th>
                  <th className="px-2 py-1">{t("valuelbl")}</th>
                  <th className="px-2 py-1">{t("textlbl")}</th>
                  <th className="px-2 py-1 text-right">{t("actionlbl")}</th>
                </tr>
              </thead>
              <tbody>
                {(question.options || []).map((opt) => (
                  <tr key={opt.id} >
                    <td className="px-2 py-1">{opt.order}</td>
                    <td className="px-2 py-1">{opt.value}</td>
                    <td className="px-2 py-1">
                      <b>🇪🇸:</b> {opt.label}
                      <br />
                      <b>🇺🇸:</b> {opt.labelEn}
                      <br />
                      <b>🇫🇷:</b> {opt.labelFr}
                    </td>
                    <td className="px-2 py-1 text-right">
                      <button
                        onClick={() => onOptionEdit(question.id, opt)}
                        className="px-2 py-1 bg-purple-800 text-white rounded mr-1"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => onOptionDelete(opt.id)}
                        className="px-2 py-1 bg-purple-800 text-white rounded"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
          </td>
        </tr>
      )}
    </Fragment>
  );
}

// ==============================
// Página Principal
// ==============================
export default function QuestionsPageClient() {
  const [questions, setQuestions] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [openOptionModal, setOpenOptionModal] = useState(false);
  const [editingOption, setEditingOption] = useState(null);
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const { t } = useTranslation();

  // Cargar preguntas
  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await fetch("/api/questions");
      const data = await res.json();
      setQuestions(data);
    } catch (err) {
      console.error("Error fetching:", err);
    }
  };

  // Guardar pregunta
  const handleSaveQuestion = async () => {
    const method = editingQuestion?.id ? "PUT" : "POST";
    await fetch("/api/questions", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingQuestion),
    });
    setOpenModal(false);
    fetchQuestions();
  };

  // Borrar pregunta
  const handleDeleteQuestion = async (id) => {
    if (!confirm(t("confirmdelquestion"))) return;
    await fetch("/api/questions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchQuestions();
  };

  // CRUD de opciones
  const handleSaveOption = async () => {
    const method = editingOption?.id ? "PUT" : "POST";
    const body = editingOption?.id
      ? editingOption
      : { ...editingOption, questionId: currentQuestionId };

    await fetch("/api/options", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setOpenOptionModal(false);
    fetchQuestions();
  };

  const handleDeleteOption = async (id) => {
    if (!confirm(t("confirmdelopt"))) return;
    await fetch("/api/options", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchQuestions();
  };

  // Abrir modales
  const handleNewQuestion = () => {
    setEditingQuestion({ key: "", title: "", titleEn: "", titleFr: "", type: "TEXT" });
    setOpenModal(true);
  };

  const handleEditQuestion = (q) => {
    setEditingQuestion(q);
    setOpenModal(true);
  };

  const handleNewOption = (qid) => {
    setCurrentQuestionId(qid);
    setEditingOption({ order: 0, value: "", label: "", labelEn: "", labelFr: "" });
    setOpenOptionModal(true);
  };

  const handleEditOption = (qid, opt) => {
    setCurrentQuestionId(qid);
    setEditingOption(opt);
    setOpenOptionModal(true);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">{t("questioncattitle")}</h1>

      <button
        onClick={handleNewQuestion}
        className="px-4 py-2 bg-purple-600 text-white rounded"
      >
        {t("newquestion")}
      </button>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full borde">
          <thead>
            <tr className="bg-purple-800 text-white">
              <th></th>
              <th className="px-2 py-1">{t("keylbl")}</th>
              <th className="px-2 py-1">{t("textlbl")}</th>
              <th className="px-2 py-1">{t("typelbl")}</th>
              <th className="px-2 py-1 text-right">{t("actionlbl")}</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => (
              <QuestionRow
                key={q.id}
                question={q}
                onEdit={handleEditQuestion}
                onDelete={handleDeleteQuestion}
                onOptionEdit={handleEditOption}
                onOptionDelete={handleDeleteOption}
                onOptionNew={handleNewOption}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Preguntas */}
      {openModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
            <h2 className="font-bold mb-4">
              {editingQuestion?.id ? "Editar Pregunta" : "Nueva Pregunta"}
            </h2>
            <input
              className="border p-2 mb-2 w-full"
              placeholder={t("keylbl")}
              value={editingQuestion?.key || ""}
              onChange={(e) => setEditingQuestion({ ...editingQuestion, key: e.target.value })}
            />
            <input
              className="border p-2 mb-2 w-full"
              placeholder={t("textlbl") + " ES"}
              value={editingQuestion?.title || ""}
              onChange={(e) => setEditingQuestion({ ...editingQuestion, title: e.target.value })}
            />
            <input
              className="border p-2 mb-2 w-full"
              placeholder={t("textlbl") + " EN"}
              value={editingQuestion?.titleEn || ""}
              onChange={(e) => setEditingQuestion({ ...editingQuestion, titleEn: e.target.value })}
            />
            <input
              className="border p-2 mb-2 w-full"
              placeholder={t("textlbl") + " FR"}
              value={editingQuestion?.titleFr || ""}
              onChange={(e) => setEditingQuestion({ ...editingQuestion, titleFr: e.target.value })}
            />
            <select
              className="border p-2 mb-2 w-full"
              value={editingQuestion?.type || "TEXT"}
              onChange={(e) => setEditingQuestion({ ...editingQuestion, type: e.target.value })}
            >
              <option value="TEXT">{t("optiontypet")}</option>
              <option value="MULTIPLE_CHOICE">{t("optiontypem")}</option>
              <option value="SCALE_1_5">{t("optiontypes")}</option>
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setOpenModal(false)} className="px-4 py-2 border rounded">
                {t("cancelbtn")}
              </button>
              <button onClick={handleSaveQuestion} className="px-4 py-2 bg-purple-600 text-white rounded">
                {t("savebtn")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Opciones */}
      {openOptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
            <h2 className="font-bold mb-4">
              {editingOption?.id ? "Editar Opción" : "Nueva Opción"}
            </h2>
            <input
              type="number"
              className="border p-2 mb-2 w-full"
              placeholder={t("orderlbl")}
              value={editingOption?.order || ""}
              onChange={(e) =>
                setEditingOption({ ...editingOption, order: parseInt(e.target.value, 10) || 0 })
              }
            />
            <input
              className="border p-2 mb-2 w-full"
              placeholder={t("valuelbl")}
              value={editingOption?.value || ""}
              onChange={(e) => setEditingOption({ ...editingOption, value: e.target.value })}
            />
            <input
              className="border p-2 mb-2 w-full"
              placeholder={t("textlbl") + " ES"}
              value={editingOption?.label || ""}
              onChange={(e) => setEditingOption({ ...editingOption, label: e.target.value })}
            />
            <input
              className="border p-2 mb-2 w-full"
              placeholder={t("textlbl") + " EN"}
              value={editingOption?.labelEn || ""}
              onChange={(e) => setEditingOption({ ...editingOption, labelEn: e.target.value })}
            />
            <input
              className="border p-2 mb-2 w-full"
              placeholder={t("textlbl") + " FR"}
              value={editingOption?.labelFr || ""}
              onChange={(e) => setEditingOption({ ...editingOption, labelFr: e.target.value })}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setOpenOptionModal(false)} className="px-4 py-2 border rounded">
                {t("cancelbtn")}
              </button>
              <button onClick={handleSaveOption} className="px-4 py-2 bg-purple-600 text-white rounded">
                {t("savebtn")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
