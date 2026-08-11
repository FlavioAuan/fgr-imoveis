"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Star, Upload, X, ImageIcon, Loader2,
} from "lucide-react";

interface Feature { id: number; name: string; }
interface Agent { id: number; name: string; }
interface PropertyImage { id: number; image_path: string; is_cover: number; display_order: number; }

interface FormData {
  title: string;
  transaction_type: string;
  property_type: string;
  status: string;
  featured: boolean;
  code: string;
  city: string;
  state: string;
  neighborhood: string;
  address: string;
  zipcode: string;
  price: string;
  condominium_fee: string;
  iptu: string;
  area: string;
  built_area: string;
  bedrooms: string;
  suites: string;
  bathrooms: string;
  parking_spaces: string;
  description: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  youtube_url: string;
  virtual_tour_url: string;
  agent_id: string;
}

const defaultForm: FormData = {
  title: "", transaction_type: "venda", property_type: "apartamento",
  status: "disponivel", featured: false, code: "",
  city: "", state: "SP", neighborhood: "", address: "", zipcode: "",
  price: "", condominium_fee: "", iptu: "", area: "", built_area: "",
  bedrooms: "0", suites: "0", bathrooms: "0", parking_spaces: "0",
  description: "", seo_title: "", seo_description: "", seo_keywords: "",
  youtube_url: "", virtual_tour_url: "", agent_id: "",
};

interface Props { id?: string; }

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 pb-2 border-b border-neutral-200">
      <h2 className="text-sm font-semibold text-neutral-700 uppercase tracking-wider">{children}</h2>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-neutral-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors bg-white";
const selectCls = "w-full border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors bg-white appearance-none";

export default function PropertyForm({ id }: Props) {
  const router = useRouter();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<FormData>(defaultForm);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<number[]>([]);
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof FormData, value: string | boolean) =>
    setForm(p => ({ ...p, [key]: value }));

  // Load features and agents
  useEffect(() => {
    Promise.all([
      fetch("/api/features").then(r => r.json()),
      fetch("/api/agents").then(r => r.json()),
    ]).then(([feats, agts]) => {
      setFeatures(Array.isArray(feats) ? feats : []);
      setAgents(Array.isArray(agts) ? agts : []);
    });
  }, []);

  // Load property for edit
  useEffect(() => {
    if (!id) return;
    fetch(`/api/properties/${id}`)
      .then(r => r.json())
      .then(data => {
        setForm({
          title:            data.title ?? "",
          transaction_type: data.transaction_type ?? "venda",
          property_type:    data.property_type ?? "apartamento",
          status:           data.status ?? "disponivel",
          featured:         Boolean(data.featured),
          code:             data.code ?? "",
          city:             data.city ?? "",
          state:            data.state ?? "SP",
          neighborhood:     data.neighborhood ?? "",
          address:          data.address ?? "",
          zipcode:          data.zipcode ?? "",
          price:            data.price != null ? String(data.price) : "",
          condominium_fee:  data.condominium_fee != null ? String(data.condominium_fee) : "",
          iptu:             data.iptu != null ? String(data.iptu) : "",
          area:             data.area != null ? String(data.area) : "",
          built_area:       data.built_area != null ? String(data.built_area) : "",
          bedrooms:         data.bedrooms != null ? String(data.bedrooms) : "0",
          suites:           data.suites != null ? String(data.suites) : "0",
          bathrooms:        data.bathrooms != null ? String(data.bathrooms) : "0",
          parking_spaces:   data.parking_spaces != null ? String(data.parking_spaces) : "0",
          description:      data.description ?? "",
          seo_title:        data.seo_title ?? "",
          seo_description:  data.seo_description ?? "",
          seo_keywords:     data.seo_keywords ?? "",
          youtube_url:      data.youtube_url ?? "",
          virtual_tour_url: data.virtual_tour_url ?? "",
          agent_id:         data.agent_id != null ? String(data.agent_id) : "",
        });
        setSelectedFeatures((data.features ?? []).map((f: Feature) => f.id));
        setImages(data.images ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  function toggleFeature(fid: number) {
    setSelectedFeatures(prev =>
      prev.includes(fid) ? prev.filter(x => x !== fid) : [...prev, fid]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const body = {
      ...form,
      featured: form.featured ? 1 : 0,
      price:           form.price ? Number(form.price) : 0,
      condominium_fee: form.condominium_fee ? Number(form.condominium_fee) : null,
      iptu:            form.iptu ? Number(form.iptu) : null,
      area:            form.area ? Number(form.area) : null,
      built_area:      form.built_area ? Number(form.built_area) : null,
      bedrooms:        Number(form.bedrooms),
      suites:          Number(form.suites),
      bathrooms:       Number(form.bathrooms),
      parking_spaces:  Number(form.parking_spaces),
      agent_id:        form.agent_id ? Number(form.agent_id) : null,
      features:        selectedFeatures,
    };

    try {
      const res = await fetch(
        isEdit ? `/api/properties/${id}` : "/api/properties",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Erro ao salvar");
        return;
      }

      router.push("/admin/imoveis");
    } catch {
      setError("Erro de conexão");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(files: FileList | File[]) {
    if (!id) return;
    const fileArr = Array.from(files);
    if (!fileArr.length) return;
    setUploadLoading(true);
    try {
      const fd = new FormData();
      fileArr.forEach(f => fd.append("files", f));
      fd.append("property_id", id);
      fd.append("is_cover", "0");
      await fetch("/api/upload", { method: "POST", body: fd });
      // Reload images
      const updated = await fetch(`/api/properties/${id}`).then(r => r.json());
      setImages(updated.images ?? []);
    } finally {
      setUploadLoading(false);
    }
  }

  async function handleDeleteImage(imageId: number) {
    if (!id) return;
    if (!window.confirm("Excluir esta imagem?")) return;
    await fetch(`/api/properties/${id}/images/${imageId}`, { method: "DELETE" });
    setImages(prev => prev.filter(img => img.id !== imageId));
  }

  async function handleSetCover(imageId: number) {
    if (!id) return;
    await fetch(`/api/properties/${id}/images/${imageId}/cover`, { method: "PATCH" });
    setImages(prev => prev.map(img => ({ ...img, is_cover: img.id === imageId ? 1 : 0 })));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-neutral-400" />
      </div>
    );
  }

  const counterField = (key: keyof FormData, label: string) => (
    <Field label={label}>
      <div className="flex items-center">
        <button type="button"
          onClick={() => set(key, String(Math.max(0, Number(form[key]) - 1)))}
          className="border border-neutral-300 border-r-0 px-3 py-2.5 text-neutral-600 hover:bg-neutral-50 transition-colors text-sm font-medium"
        >−</button>
        <input
          type="number" min={0} max={10}
          value={form[key] as string}
          onChange={e => set(key, e.target.value)}
          className="border border-neutral-300 px-3 py-2.5 text-sm text-center w-14 focus:outline-none focus:border-neutral-900 transition-colors"
        />
        <button type="button"
          onClick={() => set(key, String(Math.min(10, Number(form[key]) + 1)))}
          className="border border-neutral-300 border-l-0 px-3 py-2.5 text-neutral-600 hover:bg-neutral-50 transition-colors text-sm font-medium"
        >+</button>
      </div>
    </Field>
  );

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/imoveis"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft size={16} />
          Voltar
        </Link>
        <div className="h-4 w-px bg-neutral-300" />
        <h1 className="text-xl font-bold text-neutral-900">
          {isEdit ? "Editar imóvel" : "Novo imóvel"}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
          {error}
        </div>
      )}

      {/* SECTION: Informações básicas */}
      <div className="bg-white border border-neutral-200 p-6 space-y-5">
        <SectionTitle>Informações básicas</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <Field label="Título" required>
              <input
                type="text" required value={form.title}
                onChange={e => set("title", e.target.value)}
                placeholder="Ex: Apartamento 3 quartos em Moema"
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Tipo de transação">
            <select value={form.transaction_type} onChange={e => set("transaction_type", e.target.value)} className={selectCls}>
              <option value="venda">Venda</option>
              <option value="aluguel">Aluguel</option>
            </select>
          </Field>

          <Field label="Tipo de imóvel">
            <select value={form.property_type} onChange={e => set("property_type", e.target.value)} className={selectCls}>
              <option value="casa">Casa</option>
              <option value="apartamento">Apartamento</option>
              <option value="cobertura">Cobertura</option>
              <option value="studio">Studio</option>
              <option value="terreno">Terreno</option>
              <option value="comercial">Comercial</option>
              <option value="condominio">Condomínio</option>
            </select>
          </Field>

          <Field label="Status">
            <select value={form.status} onChange={e => set("status", e.target.value)} className={selectCls}>
              <option value="disponivel">Disponível</option>
              <option value="vendido">Vendido</option>
              <option value="alugado">Alugado</option>
              <option value="reservado">Reservado</option>
              <option value="inativo">Inativo</option>
            </select>
          </Field>

          <Field label="Código">
            <input
              type="text" value={form.code}
              onChange={e => set("code", e.target.value)}
              placeholder="Deixe em branco para gerar automaticamente"
              className={inputCls}
            />
          </Field>

          <div className="md:col-span-2 flex items-center gap-3">
            <input
              id="featured" type="checkbox"
              checked={form.featured}
              onChange={e => set("featured", e.target.checked)}
              className="w-4 h-4 border-neutral-300 accent-neutral-900"
            />
            <label htmlFor="featured" className="text-sm font-medium text-neutral-700 flex items-center gap-2 cursor-pointer">
              <Star size={15} className={form.featured ? "text-yellow-500" : "text-neutral-400"} />
              Imóvel em destaque
            </label>
          </div>
        </div>
      </div>

      {/* SECTION: Localização */}
      <div className="bg-white border border-neutral-200 p-6 space-y-5">
        <SectionTitle>Localização</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Cidade" required>
            <input type="text" required value={form.city} onChange={e => set("city", e.target.value)} placeholder="São Paulo" className={inputCls} />
          </Field>
          <Field label="Estado">
            <input type="text" maxLength={2} value={form.state} onChange={e => set("state", e.target.value.toUpperCase())} placeholder="SP" className={inputCls} />
          </Field>
          <Field label="Bairro">
            <input type="text" value={form.neighborhood} onChange={e => set("neighborhood", e.target.value)} placeholder="Vila Madalena" className={inputCls} />
          </Field>
          <Field label="CEP">
            <input type="text" value={form.zipcode} onChange={e => set("zipcode", e.target.value)} placeholder="00000-000" className={inputCls} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Endereço">
              <input type="text" value={form.address} onChange={e => set("address", e.target.value)} placeholder="Rua, número, complemento" className={inputCls} />
            </Field>
          </div>
        </div>
      </div>

      {/* SECTION: Detalhes */}
      <div className="bg-white border border-neutral-200 p-6 space-y-5">
        <SectionTitle>Detalhes</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Field label="Preço (R$)" required>
            <input
              type="number" required min={0} step="0.01"
              value={form.price} onChange={e => set("price", e.target.value)}
              placeholder="0"
              className={inputCls}
            />
          </Field>
          <Field label="Condomínio (R$)">
            <input type="number" min={0} step="0.01" value={form.condominium_fee} onChange={e => set("condominium_fee", e.target.value)} placeholder="0" className={inputCls} />
          </Field>
          <Field label="IPTU anual (R$)">
            <input type="number" min={0} step="0.01" value={form.iptu} onChange={e => set("iptu", e.target.value)} placeholder="0" className={inputCls} />
          </Field>
          <Field label="Área total (m²)">
            <input type="number" min={0} value={form.area} onChange={e => set("area", e.target.value)} placeholder="0" className={inputCls} />
          </Field>
          <Field label="Área construída (m²)">
            <input type="number" min={0} value={form.built_area} onChange={e => set("built_area", e.target.value)} placeholder="0" className={inputCls} />
          </Field>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 pt-2">
          {counterField("bedrooms", "Quartos")}
          {counterField("suites", "Suítes")}
          {counterField("bathrooms", "Banheiros")}
          {counterField("parking_spaces", "Vagas")}
        </div>
      </div>

      {/* SECTION: Descrição */}
      <div className="bg-white border border-neutral-200 p-6 space-y-5">
        <SectionTitle>Descrição</SectionTitle>
        <Field label="Descrição do imóvel">
          <textarea
            rows={6}
            value={form.description}
            onChange={e => set("description", e.target.value)}
            placeholder="Descreva o imóvel com detalhes relevantes para os compradores..."
            className="w-full border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors resize-y"
          />
        </Field>
      </div>

      {/* SECTION: Características */}
      {features.length > 0 && (
        <div className="bg-white border border-neutral-200 p-6 space-y-5">
          <SectionTitle>Características</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {features.map(f => (
              <label key={f.id} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedFeatures.includes(f.id)}
                  onChange={() => toggleFeature(f.id)}
                  className="w-4 h-4 border-neutral-300 accent-neutral-900"
                />
                <span className="text-sm text-neutral-700 group-hover:text-neutral-900 transition-colors">
                  {f.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: SEO */}
      <div className="bg-white border border-neutral-200 p-6 space-y-5">
        <SectionTitle>SEO</SectionTitle>
        <div className="space-y-4">
          <Field label="Título SEO">
            <input type="text" value={form.seo_title} onChange={e => set("seo_title", e.target.value)} placeholder="Título para mecanismos de busca" className={inputCls} />
          </Field>
          <Field label="Descrição SEO">
            <input type="text" value={form.seo_description} onChange={e => set("seo_description", e.target.value)} placeholder="Descrição curta para mecanismos de busca" className={inputCls} />
          </Field>
          <Field label="Palavras-chave">
            <input type="text" value={form.seo_keywords} onChange={e => set("seo_keywords", e.target.value)} placeholder="palavra1, palavra2, palavra3" className={inputCls} />
          </Field>
        </div>
      </div>

      {/* SECTION: Outros */}
      <div className="bg-white border border-neutral-200 p-6 space-y-5">
        <SectionTitle>Outros</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="URL do vídeo (YouTube)">
            <input type="url" value={form.youtube_url} onChange={e => set("youtube_url", e.target.value)} placeholder="https://youtube.com/watch?v=..." className={inputCls} />
          </Field>
          <Field label="Tour virtual">
            <input type="url" value={form.virtual_tour_url} onChange={e => set("virtual_tour_url", e.target.value)} placeholder="https://..." className={inputCls} />
          </Field>
          <Field label="Corretor responsável">
            <select value={form.agent_id} onChange={e => set("agent_id", e.target.value)} className={selectCls}>
              <option value="">Nenhum</option>
              {agents.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      {/* SECTION: Fotos — only when editing */}
      {isEdit && (
        <div className="bg-white border border-neutral-200 p-6 space-y-5">
          <SectionTitle>Fotos</SectionTitle>

          {/* Existing images */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-4">
              {images.map(img => (
                <div key={img.id} className="relative group border border-neutral-200 overflow-hidden">
                  <img
                    src={img.image_path}
                    alt=""
                    className="w-full aspect-[4/3] object-cover"
                  />
                  {/* Cover badge */}
                  {img.is_cover ? (
                    <div className="absolute top-1 left-1 bg-yellow-500 text-white text-[10px] font-bold px-1.5 py-0.5 flex items-center gap-0.5">
                      <Star size={9} fill="white" /> CAPA
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetCover(img.id)}
                      className="absolute top-1 left-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Definir capa
                    </button>
                  )}
                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(img.id)}
                    className="absolute top-1 right-1 bg-red-600 text-white p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload zone */}
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => {
              e.preventDefault();
              setIsDragging(false);
              handleUpload(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed cursor-pointer flex flex-col items-center justify-center py-10 px-4 transition-colors ${
              isDragging ? "border-neutral-900 bg-neutral-50" : "border-neutral-300 hover:border-neutral-500"
            }`}
          >
            {uploadLoading ? (
              <div className="flex flex-col items-center gap-2 text-neutral-500">
                <Loader2 size={28} className="animate-spin" />
                <span className="text-sm">Enviando imagens...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-neutral-500 pointer-events-none">
                <div className="flex items-center gap-2">
                  <ImageIcon size={24} />
                  <Upload size={24} />
                </div>
                <p className="text-sm font-medium">Arraste fotos ou clique para selecionar</p>
                <p className="text-xs text-neutral-400">JPG, PNG, WEBP — múltiplos arquivos permitidos</p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={e => {
              if (e.target.files) handleUpload(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      )}

      {/* Submit row */}
      <div className="flex items-center justify-between gap-4 pb-8">
        <Link
          href="/admin/imoveis"
          className="px-5 py-2.5 text-sm font-medium text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 bg-neutral-900 text-white px-6 py-2.5 text-sm font-medium hover:bg-neutral-700 transition-colors disabled:opacity-50"
        >
          {saving && <Loader2 size={15} className="animate-spin" />}
          {saving ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar imóvel"}
        </button>
      </div>
    </form>
  );
}
