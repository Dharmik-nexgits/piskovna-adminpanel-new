"use client";

import React, { useState } from "react";
import {
  Save,
  Image as ImageIcon,
  ArrowLeft,
  Trash2,
  Plus,
  UploadCloud,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { Checkbox } from "@/components/ui/Checkbox";
import { TagsInput } from "@/components/ui/TagsInput";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { ImageViewer } from "@/components/ui/ImageViewer";
import dynamic from "next/dynamic";
import Image from "next/image";

const Editor = dynamic(() => import("@/components/ui/Editor"), {
  ssr: false,
});

import { useAppContext } from "@/contexts/AppContext";
import { useRouter } from "next/navigation";
import constants from "@/lib/constants";
import { validateImage } from "@/lib/utils";
import { message } from "antd";

export default function BlogDetailsPage() {
  const { apiRequest } = useAppContext();
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === "new";

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState(""); // Add slug state
  const [description, setDescription] = useState(""); // Maps to 'description'
  const [metaTitle, setMetaTitle] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [contentHtml1, setContentHtml1] = useState("");
  const [contentHtml2, setContentHtml2] = useState("");

  const [tags, setTags] = useState<string[]>([]);
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  const [status, setStatus] = useState("Publikováno");
  const [category, setCategory] = useState("Education");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]); // Default today
  const [showNewsletter, setShowNewsletter] = useState(true);
  const [aosDuration, setAosDuration] = useState("");

  const [viewerImage, setViewerImage] = useState<string | null>(null);
  const galleryInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!isNew) {
      const fetchBlog = async () => {
        try {
          const res = await apiRequest({
            url: `${constants.apis.blog}/${params.id}`,
            method: "GET",
          });
          if (res && "data" in res && (res as any).data.data) {
            const post = (res as any).data.data;
            setTitle(post.title || "");
            setSlug(post.slug || "");
            setDescription(post.description || "");
            setContentHtml1(post.descriptionhtml1 || "");
            setContentHtml2(post.descriptionhtml2 || "");
            setTags(post.tags || []);
            setFeaturedImage(post.featured_image || null);
            setGalleryImages(post.gallery_images || []);
            setStatus(post.status || "Publikováno");
            setCategory(post.category || "Education");
            setDate(
              post.date
                ? new Date(post.date).toISOString().split("T")[0]
                : new Date().toISOString().split("T")[0],
            );
            setShowNewsletter(post.show_newsletter !== false);
            setMetaTitle(post.meta_title || "");
            setMetaKeywords(post.meta_keywords || "");
            setAosDuration(post.aos_duration || "");
          }
        } catch (error) {
          console.error("Failed to fetch blog:", error);
        }
      };
      fetchBlog();
    }
  }, [isNew, params.id, apiRequest]);

  const handleSave = async () => {
    const payload = {
      title,
      description,
      descriptionhtml1: contentHtml1,
      descriptionhtml2: contentHtml2,
      tags,
      featured_image: featuredImage,
      gallery_images: galleryImages,
      status,
      category,
      date,
      show_newsletter: showNewsletter,
      slug,
      meta_title: metaTitle,
      meta_keywords: metaKeywords,
      aos_duration: aosDuration,
    };

    try {
      if (isNew) {
        await apiRequest({
          url: constants.apis.blog,
          method: "POST",
          data: payload,
        });
      } else {
        await apiRequest({
          url: `${constants.apis.blog}/${params.id}`,
          method: "PUT",
          data: payload,
        });
      }
      router.push("/blog");
    } catch (error) {
      console.error("Failed to save blog:", error);
    }
  };

  const handleGalleryClick = () => {
    galleryInputRef.current?.click();
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleGalleryFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const validImages: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const error = await validateImage(file, {
          ratio: 9 / 16,
          maxSizeInMB: 5,
          allowedFormats: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/avif",
          ],
        });

        if (error) {
          message.error(
            `Nahrajte prosím obrázek s poměrem stran 9:16. ${error}`,
          );
        } else {
          const base64 = await readFileAsDataURL(file);
          validImages.push(base64);
        }
      }

      if (validImages.length > 0) {
        setGalleryImages([...galleryImages, ...validImages]);
      }
    }
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleGalleryFileChange({
        target: {
          files,
        },
      } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="space-y-8 mx-auto pb-10">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-16 z-10 bg-gray-50/95 backdrop-blur py-4 border-b border-gray-200/50 -mx-6 px-6 sm:mx-0 sm:px-0 sm:bg-transparent sm:border-none sm:py-0 sm:backdrop-blur-none sm:static">
        <div className="flex items-center gap-4">
          <Link
            href="/blog"
            className="p-2.5 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-primary hover:border-primary/30 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
              {isNew ? "Vytvořit článek" : "Upravit článek"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/blog">
            <Button variant="outline" className="rounded-xl">
              Zrušit
            </Button>
          </Link>
          <Button
            onClick={handleSave}
            className="gap-2 rounded-xl shadow-lg shadow-primary/25"
          >
            <Save className="w-4 h-4" />
            Uložit změny
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* General Information Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-6 overflow-hidden">
            <div className="border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="w-1 h-6 bg-primary rounded-full"></span>
                Obsah článku
              </h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Input
                  label="Název článku"
                  placeholder="Zadejte poutavý název..."
                  className="text-lg font-medium placeholder:font-normal"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Input
                  label="Meta titulek"
                  placeholder="SEO titulek (výchozí je název článku)"
                  className="rounded-xl"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Input
                  label="Meta klíčová slova"
                  placeholder="víno, ochutnávka, praha..."
                  className="rounded-xl"
                  value={metaKeywords}
                  onChange={(e) => setMetaKeywords(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  URL adresa (slug)
                </label>
                <div className="flex rounded-xl border border-gray-200 bg-gray-50/50 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                  <span className="px-4 py-2.5 text-gray-400 bg-gray-100 border-r border-gray-200 text-sm flex items-center">
                    https://piskovna.cz/blog/
                  </span>
                  <input
                    type="text"
                    placeholder="post-url-slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-transparent border-none focus:outline-none text-sm text-gray-600"
                  />
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <Editor
                  holder="blog-editor"
                  label="Popis"
                  value={description}
                  onChange={(val) => setDescription(val)}
                />
                <Editor
                  holder="blog-editor-html-1"
                  label="Popis HTML 1"
                  value={contentHtml1}
                  onChange={(val) => setContentHtml1(val)}
                />
                <Editor
                  holder="blog-editor-html-2"
                  label="Popis HTML 2"
                  value={contentHtml2}
                  onChange={(val) => setContentHtml2(val)}
                />
              </div>
            </div>
          </div>

          {/* Gallery Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-6 overflow-hidden">
            <div className="border-b border-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                Galerie článku
              </h3>
            </div>
            <div>
              {galleryImages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {galleryImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer"
                      onClick={() => setViewerImage(img)}
                    >
                      <Image
                        src={img}
                        width={100}
                        height={100}
                        alt={`Gallery ${idx}`}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                      <button
                        className="absolute top-0 right-0 p-1.5 text-red-500 cursor-pointer rounded-full hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          setGalleryImages(
                            galleryImages.filter((_, i) => i !== idx),
                          );
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div
                    onClick={handleGalleryClick}
                    className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary hover:bg-primary/5 cursor-pointer transition-all"
                  >
                    <Plus className="w-8 h-8 mb-1" />
                    <span className="text-xs font-semibold">Přidat</span>
                  </div>
                </div>
              ) : (
                // <div
                //   onClick={handleGalleryClick}
                //   className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary hover:bg-gray-50 transition-all group"
                // >
                //   <ImageIcon className="w-10 h-10 text-gray-300 group-hover:text-primary mb-3 transition-colors" />
                //   <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">
                //     Klikněte pro nahrání
                //   </span>
                // </div>
                <div
                  onClick={handleGalleryClick}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-secondary rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary hover:bg-brand-bg/50 transition-all group min-h-[200px]"
                >
                  <div className="w-12 h-12 rounded-full bg-secondary/30 flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                    <UploadCloud className="w-6 h-6 text-gray-500 group-hover:text-primary transition-colors" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    Klikněte pro nahrání nebo přetáhněte sem
                  </span>
                  <span className="text-xs text-gray-400 mt-1">
                    SVG, PNG, JPG nebo GIF (max. 5MB)
                  </span>
                </div>
              )}
              <input
                type="file"
                ref={galleryInputRef}
                className="hidden"
                multiple
                accept="image/*"
                onChange={handleGalleryFileChange}
              />
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Publish Status */}
          <div className="bg-white rounded-2xl shadow-sm border p-5 space-y-6 border-gray-100">
            <div className="border-b border-gray-50">
              <h3 className="text-base font-bold text-gray-800">Publikování</h3>
            </div>
            <div className="space-y-4">
              <Select
                label="Stav"
                options={[
                  { value: "Publikováno", label: "Publikováno" },
                  { value: "Návrh", label: "Návrh" },
                  { value: "Archivováno", label: "Archivováno" },
                ]}
                value={status}
                onChange={(val) => setStatus(val)}
              />
              <DatePicker
                label="Datum publikování"
                value={date}
                onChange={(e: {
                  target: { value: React.SetStateAction<string> };
                }) => setDate(e.target.value)}
              />
            </div>
            <Checkbox
              label="Zobrazit Newsletter"
              checked={showNewsletter}
              onCheckedChange={setShowNewsletter}
            />
          </div>

          {/* Organization */}
          <div className="bg-white rounded-2xl shadow-sm p-5 space-y-6 border border-gray-100">
            <div className="border-b border-gray-50">
              <h3 className="text-base font-bold text-gray-800">Organizace</h3>
            </div>
            <div className="space-y-4">
              <Select
                label="Kategorie"
                options={[
                  { value: "Education", label: "Vzdělávání" },
                  { value: "News", label: "Novinky" },
                  { value: "Reviews", label: "Recenze" },
                  { value: "Guides", label: "Průvodci" },
                  { value: "Announcements", label: "Oznámení" },
                ]}
                value={category}
                onChange={(val) => setCategory(val)}
              />
              <TagsInput
                label="Štítky"
                value={tags}
                onChange={setTags}
                placeholder="Přidejte štítek a stiskněte Enter..."
              />
              <Input
                label="AOS Trvání"
                placeholder="např. 1000"
                value={aosDuration}
                onChange={(e) => setAosDuration(e.target.value)}
              />
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-6 overflow-hidden">
            <div className="border-b border-gray-50">
              <h3 className="text-base font-bold text-gray-800">
                Vybraný obrázek
              </h3>
            </div>
            <div>
              <ImageUploader
                value={featuredImage}
                onChange={setFeaturedImage}
                validationRules={{
                  ratio: 16 / 9,
                  maxSizeInMB: 5,
                  allowedFormats: [
                    "image/jpeg",
                    "image/png",
                    "image/webp",
                    "image/avif",
                  ],
                }}
                onError={(msg) =>
                  message.error(
                    `Nahrajte prosím obrázek s poměrem stran 16:9. ${msg}`,
                  )
                }
              />
            </div>
          </div>
        </div>
      </div>
      <ImageViewer src={viewerImage} onClose={() => setViewerImage(null)} />
    </div>
  );
}
