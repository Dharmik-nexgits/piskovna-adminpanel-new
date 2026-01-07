"use client";

import React, { useState } from "react";
import {
  Save,
  X,
  Image as ImageIcon,
  Calendar,
  User,
  Tag,
  ArrowLeft,
  Trash2,
  Plus,
  Globe,
  MoreVertical,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { TagsInput } from "@/components/ui/TagsInput";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { ImageViewer } from "@/components/ui/ImageViewer";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@/components/ui/Editor"), {
  ssr: false,
});

export default function BlogDetailsPage() {
  const params = useParams();
  const isNew = params.id === "new";

  // State for interactive features
  const [tags, setTags] = useState<string[]>(["Wine", "Tasting", "Events"]);
  const [newTag, setNewTag] = useState("");
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [viewerImage, setViewerImage] = useState<string | null>(null);

  // Mock handlers
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTag.trim()) {
      e.preventDefault();
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
      }
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const galleryInputRef = React.useRef<HTMLInputElement>(null);

  const handleGalleryClick = () => {
    galleryInputRef.current?.click();
  };

  const handleGalleryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newImages = Array.from(files).map((file) =>
        URL.createObjectURL(file),
      );
      setGalleryImages([...galleryImages, ...newImages]);
    }
  };

  return (
    <div className="space-y-8 mx-auto pb-10">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-[64px] z-10 bg-gray-50/95 backdrop-blur py-4 border-b border-gray-200/50 -mx-6 px-6 sm:mx-0 sm:px-0 sm:bg-transparent sm:border-none sm:py-0 sm:backdrop-blur-none sm:static">
        <div className="flex items-center gap-4">
          <Link
            href="/blog"
            className="p-2.5 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-primary hover:border-primary/30 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
              {isNew ? "Create Post" : "Edit Post"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/blog">
            <Button variant="outline" className="rounded-xl">
              Cancel
            </Button>
          </Link>
          <Button className="gap-2 rounded-xl shadow-lg shadow-primary/25">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* General Information Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="w-1 h-6 bg-primary rounded-full"></span>
                Post Content
              </h3>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <Input
                  label="Post Title"
                  placeholder="Enter an engaging title..."
                  className="text-lg font-medium placeholder:font-normal"
                  defaultValue={isNew ? "" : ""}
                />
              </div>
              <div className="space-y-2">
                <Input
                  label="Meta Title"
                  placeholder="SEO Title (defaults to post title)"
                  className="rounded-xl"
                />
                <p className="text-xs text-gray-400 text-right">0 / 60</p>
              </div>
              <div className="space-y-2">
                <Input
                  label="Meta Keywords"
                  placeholder="wine, tasting, prague..."
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Slug
                </label>
                <div className="flex rounded-xl border border-gray-200 bg-gray-50/50 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                  <span className="px-4 py-2.5 text-gray-400 bg-gray-100 border-r border-gray-200 text-sm flex items-center">
                    https://piskovna.cz/blog/
                  </span>
                  <input
                    type="text"
                    placeholder="post-url-slug"
                    className="flex-1 px-4 py-2.5 bg-transparent border-none focus:outline-none text-sm text-gray-600"
                    defaultValue={isNew ? "" : ""}
                  />
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <Editor
                  holder="blog-editor"
                  label="Description"
                  value={isNew ? "" : ""}
                  onChange={(val) => console.log("Content changed:", val)}
                />
              </div>
            </div>
          </div>

          

          {/* Gallery Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                Post Gallery
              </h3>
              <button
                onClick={handleGalleryClick}
                className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-all"
              >
                Add Images
              </button>
            </div>
            <div className="p-6">
              {galleryImages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {galleryImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer"
                      onClick={() => setViewerImage(img)}
                    >
                      <img
                        src={img}
                        alt={`Gallery ${idx}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          className="p-1.5 bg-white text-red-500 rounded-full hover:bg-red-50"
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
                    </div>
                  ))}
                  <div
                    onClick={handleGalleryClick}
                    className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary hover:bg-primary/5 cursor-pointer transition-all"
                  >
                    <Plus className="w-8 h-8 mb-1" />
                    <span className="text-xs font-semibold">Add More</span>
                  </div>
                </div>
              ) : (
                <div
                  onClick={handleGalleryClick}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary hover:bg-gray-50 transition-all group"
                >
                  <ImageIcon className="w-10 h-10 text-gray-300 group-hover:text-primary mb-3 transition-colors" />
                  <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">
                    Click to upload
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-50">
              <h3 className="text-base font-bold text-gray-800">Publishing</h3>
            </div>

            <div className="p-4 space-y-4">
              <Select
                label="Status"
                options={[
                  { value: "published", label: "Published" },
                  { value: "draft", label: "Draft" },
                  { value: "archived", label: "Archived" },
                ]}
                defaultValue="published"
              />

              <Select
                label="Visibility"
                options={[
                  { value: "public", label: "Public" },
                  { value: "private", label: "Private" },
                  { value: "password", label: "Password Protected" },
                ]}
                defaultValue="public"
              />

              <DatePicker label="Publish Date" defaultValue="2024-10-15" />
            </div>
          </div>

          {/* Organization */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-50">
              <h3 className="text-base font-bold text-gray-800">
                Organization
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <Select
                label="Category"
                options={[
                  { value: "education", label: "Education" },
                  { value: "news", label: "News" },
                  { value: "reviews", label: "Reviews" },
                ]}
                defaultValue="education"
              />

              <Select
                label="Author"
                options={[
                  { value: "jan", label: "Jan Vokál" },
                  { value: "admin", label: "Admin User" },
                ]}
                defaultValue="jan"
              />

              <TagsInput
                label="Tags"
                value={tags}
                onChange={setTags}
                placeholder="Add tag and hit Enter..."
              />
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-50">
              <h3 className="text-base font-bold text-gray-800">
                Featured Image
              </h3>
            </div>

            <div className="p-4">
              <ImageUploader
                value={featuredImage}
                onChange={setFeaturedImage}
              />
            </div>
          </div>
        </div>
      </div>
      <ImageViewer src={viewerImage} onClose={() => setViewerImage(null)} />
    </div>
  );
}
