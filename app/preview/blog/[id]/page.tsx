/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAppContext } from "@/contexts/AppContext";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import NewsletterSection from "@/components/NewsletterSection";
import { BlogPost } from "@/lib/types";
import { ImageViewer } from "@/components/ui/ImageViewer";

export default function BlogPreviewPage() {
  const params = useParams();
  const { apiRequest, store } = useAppContext();
  const idParam = params?.id;
  const decodedId = idParam ? decodeURIComponent(idParam as string) : "";
  const [openImageModal, setOpenImageModal] = useState({
    url: "",
    index: 0,
    open: false,
  });
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);

  useEffect(() => {
    const loadPost = async () => {
      if (
        decodedId &&
        Array.isArray(store.blogPosts) &&
        store.blogPosts.length > 0
      ) {
        const posts = store.blogPosts as BlogPost[];
        const foundPost = posts.find((p) => {
          const idMatch = p.id.toString() === decodedId;
          const slugMatch = p.slug === decodedId || p.slug === idParam;
          return idMatch || slugMatch;
        });

        if (foundPost) {
          setPost(foundPost);
          setLoading(false);
          return;
        }
      }

      if (decodedId) {
        try {
          await apiRequest({
            url: `/api/blog/${decodedId}`,
            method: "GET",
            onSuccess: (res) => {
              if (res && res.data && res.data.data) {
                setPost(res.data.data);
              }
            },
            onError: (err) => {
              console.error("Failed to fetch blog post", err);
            },
          });
        } catch (e) {
          console.error("Error fetching blog post", e);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadPost();
  }, [decodedId, idParam, store.blogPosts, apiRequest]);

  const handlePrevGallery = () => {
    if (galleryStartIndex > 0) {
      setGalleryStartIndex((prev) => Math.max(0, prev - 1));
    }
  };

  const handleNextGallery = () => {
    if (
      post &&
      post.gallery_images &&
      galleryStartIndex + 4 < post.gallery_images.length
    ) {
      setGalleryStartIndex((prev) => prev + 1);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-32 text-xl font-medium text-[#103758]">
          Loading preview...
        </div>
      );
    }

    if (!post) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center text-[#103758]">
          <h1 className="text-3xl font-serif mb-4">
            Příspěvek na blogu nenalezen
          </h1>
          <p className="mb-6 opacity-80 max-w-md">
            Nepodařilo se nám najít hledaný blogový příspěvek. Možná byl
            odstraněn nebo je odkaz nesprávný.
          </p>
          <div className="flex gap-4">
            <Link href="/blog">
              <Button className="bg-[#103758] hover:bg-[#0d2b45] text-white">
                Zpět na blogy
              </Button>
            </Link>
          </div>
        </div>
      );
    }

    return (
      <main className="w-full flex justify-center items-center p-4">
        <div className="w-full h-full p-2">
          <div className="flex gap-3 mb-8">
            {post.tags &&
              post.tags.length > 0 &&
              post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-6 py-2 bg-[#d5c3ad] text-[#103758] text-base font-bold rounded-full transition-transform hover:scale-105"
                >
                  {tag}
                </span>
              ))}
          </div>
          <div className="p-6 bg-brand-bg rounded-sm space-y-4">
            <div className="space-y-2" data-aos="fade-up">
              <h2 className="text-[#0b1f3b] mb-3.75 lg:text-4xl text-2xl font-bold">
                {post.title}
              </h2>
              <p className="text-[#0b1f3b] para-fs-19">{post.date}</p>
            </div>
            <div className="flex h-full justify-between items-end gap-6">
              <img
                data-aos="fade-up"
                src={
                  `${process.env.NEXT_PUBLIC_BASE_URL}/${post.featured_image}` ||
                  "/images/blogdetail_img.jpg"
                }
                alt={post.title}
                className="relative w-6/12 h-auto rounded-sm"
                onClick={() =>
                  setOpenImageModal({
                    url:
                      `${process.env.NEXT_PUBLIC_BASE_URL}/${post.featured_image}` ||
                      "/images/blogdetail_img.jpg",
                    index: 0,
                    open: true,
                  })
                }
              />
              <div
                className="para-fs-19 text-lg flex-1 wrap-break-word pb-4 blog-content"
                data-aos="fade-up"
                dangerouslySetInnerHTML={{
                  __html: post.description || "No content available",
                }}
              />
            </div>
          </div>

          {/* Content HTML 1 */}
          {post.descriptionhtml1 && (
            <div className="flex items-center w-full py-12 px-14">
              <div
                className="flex justify-center items-center w-5/6 text-[#0b1f3b] whitespace-normal"
                data-aos="fade-up"
                data-aos-duration="1000"
              >
                <div
                  className="para-fs-19 max-w-full wrap-break-word blog-content"
                  dangerouslySetInnerHTML={{
                    __html: post.descriptionhtml1,
                  }}
                />
              </div>
            </div>
          )}
          {/* Newsletter Section */}
          {post.show_newsletter !== false && <NewsletterSection />}

          {/* Content HTML 2 */}
          {post.descriptionhtml2 && (
            <div className="flex items-center w-full py-12 px-14">
              <div
                className="flex items-center w-5/6 text-[#0b1f3b] whitespace-normal"
                data-aos="fade-up"
                data-aos-duration="1000"
              >
                <div
                  className="para-fs-19 max-w-full wrap-break-word blog-content"
                  dangerouslySetInnerHTML={{
                    __html: post.descriptionhtml2,
                  }}
                />
              </div>
            </div>
          )}
          {/* Photo Gallery */}
          {post.gallery_images && post.gallery_images.length > 0 && (
            <div className="py-12">
              <h3 className="text-lg font-bold font-sans mb-6">Fotogalerie</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-64 md:h-80">
                {post.gallery_images
                  .slice(galleryStartIndex, galleryStartIndex + 4)
                  .map((img, i) => (
                    <div
                      key={i}
                      className="bg-[#D6D1C4] w-full h-full relative group cursor-pointer overflow-hidden"
                    >
                      <img
                        src={`${process.env.NEXT_PUBLIC_BASE_URL}/${img}`}
                        alt={`Gallery ${i}`}
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        onClick={() =>
                          setOpenImageModal({ url: `${process.env.NEXT_PUBLIC_BASE_URL}/${img}`, index: i, open: true })
                        }
                      />
                    </div>
                  ))}
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={handlePrevGallery}
                  disabled={galleryStartIndex === 0}
                  className={`w-8 h-8 flex items-center justify-center bg-[#D6D1C4] transition-colors text-gray-700 ${
                    galleryStartIndex === 0
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-[#C9BFA8] cursor-pointer"
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextGallery}
                  disabled={
                    galleryStartIndex + 4 >= (post.gallery_images?.length || 0)
                  }
                  className={`w-8 h-8 flex items-center justify-center bg-[#D6D1C4] transition-colors text-gray-700 ${
                    galleryStartIndex + 4 >= (post.gallery_images?.length || 0)
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-[#C9BFA8] cursor-pointer"
                  }`}
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-[#e7dcd1] para-fs-19 text-gray-900">
        {renderContent()}
      </div>
      <ImageViewer
        onClose={() => setOpenImageModal({ url: "", index: 0, open: false })}
        src={openImageModal.url || ""}
      />
    </>
  );
}
