"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Filter,
  Calendar as CalendarIcon,
  ChevronsUpDown,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";

// ... (blogPosts array stays the same) ...
const blogPosts = [
  {
    id: 1,
    title: "The Art of Wine Tasting",
    author: "Jan Vokál",
    authorAvatar: null,
    category: "Education",
    status: "Published",
    date: "2024-10-15",
    views: 1240,
  },
  {
    id: 2,
    title: "Harvest Season 2024",
    author: "Mlýn Resort",
    authorAvatar: null,
    category: "News",
    status: "Draft",
    date: "2024-11-02",
    views: 85,
  },
  {
    id: 3,
    title: "Top 10 Red Wines",
    author: "Golf Čertovo",
    authorAvatar: null,
    category: "Reviews",
    status: "Published",
    date: "2024-09-20",
    views: 3500,
  },
  {
    id: 4,
    title: "Organic vs. Biodynamic",
    author: "V Nebi.cz",
    authorAvatar: null,
    category: "Education",
    status: "Archived",
    date: "2023-12-05",
    views: 900,
  },
  {
    id: 5,
    title: "New Sommeliers Joined",
    author: "MN Holding",
    authorAvatar: null,
    category: "Announcements",
    status: "Published",
    date: "2024-10-01",
    views: 150,
  },
  {
    id: 6,
    title: "Winter Wine Pairings",
    author: "SEBRE, a.s.",
    authorAvatar: null,
    category: "Guides",
    status: "Scheduled",
    date: "2024-12-10",
    views: 0,
  },
];

export default function BlogPage() {
  const [currentPage, setCurrentPage] = useState(1);
  return (
    <div className="space-y-6">
      {/* Top Header Section */}

      {/* Sub Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-t-lg border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-700">
          Blog List{" "}
          <span className="text-gray-400 font-normal">
            ({blogPosts.length})
          </span>
        </h2>
        <Link href="/blog/new">
          <Button className="gap-2 shadow-sm">
            <Plus className="w-4 h-4" />
            Add New
          </Button>
        </Link>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-b-lg shadow-sm border border-secondary/20 overflow-hidden">
        <Table>
          <TableHeader>
            {/* Header Titles */}
            <TableRow className="bg-gray-50/50 border-b border-gray-200">
              <TableHead className="min-w-[250px]">Title</TableHead>
              <TableHead className="min-w-[200px]">
                <div className="flex items-center gap-1 cursor-pointer hover:text-primary">
                  Author <ChevronsUpDown className="w-3 h-3 text-gray-400" />
                </div>
              </TableHead>
              <TableHead className="min-w-[150px]">
                <div className="flex items-center gap-1 cursor-pointer hover:text-primary">
                  Category <ChevronsUpDown className="w-3 h-3 text-gray-400" />
                </div>
              </TableHead>
              <TableHead className="min-w-[150px]">
                <div className="flex items-center gap-1 cursor-pointer hover:text-primary">
                  Date <ChevronsUpDown className="w-3 h-3 text-gray-400" />
                </div>
              </TableHead>
              <TableHead className="min-w-[120px]">
                <div className="flex items-center gap-1 cursor-pointer hover:text-primary">
                  Status <ChevronsUpDown className="w-3 h-3 text-gray-400" />
                </div>
              </TableHead>
              <TableHead className="min-w-[100px]">
                <div className="flex items-center gap-1 cursor-pointer hover:text-primary">
                  Views <ChevronsUpDown className="w-3 h-3 text-gray-400" />
                </div>
              </TableHead>
            </TableRow>

            {/* Filter Row */}
            <TableRow className="bg-white border-b border-gray-100 hover:bg-white">
              <TableCell className="p-2">
                <Input
                  type="text"
                  className="h-8 text-xs bg-white"
                  placeholder="Filter title..."
                  icon={<Filter className="w-3 h-3" />}
                />
              </TableCell>
              <TableCell className="p-2">
                <Input
                  type="text"
                  className="h-8 text-xs bg-white"
                  placeholder="Filter author..."
                  icon={<Filter className="w-3 h-3" />}
                />
              </TableCell>
              <TableCell className="p-2">
                <Input
                  type="text"
                  className="h-8 text-xs bg-white"
                  icon={<Filter className="w-3 h-3" />}
                />
              </TableCell>
              <TableCell className="p-2">
                <div className="relative">
                  <div className="flex items-center w-full px-3 h-8 text-xs border border-secondary rounded-xl text-gray-400 cursor-pointer bg-white/50">
                    <span className="truncate">Select date</span>
                  </div>
                  <CalendarIcon className="w-3 h-3 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </TableCell>
              <TableCell className="p-2">
                <Input
                  type="text"
                  className="h-8 text-xs bg-white"
                  icon={<Filter className="w-3 h-3" />}
                />
              </TableCell>
              <TableCell className="p-2">
                <Input
                  type="text"
                  className="h-8 text-xs bg-white"
                  icon={<Filter className="w-3 h-3" />}
                />
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            {blogPosts.map((post) => (
              <TableRow
                key={post.id}
                className="hover:bg-brand-bg/10 transition-colors group border-b border-gray-50 last:border-b-0"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    {/* Avatar Logic */}
                    <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 overflow-hidden shrink-0">
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <Link
                        href={`/blog/${post.id}`}
                        className="text-sm font-semibold text-primary group-hover:underline cursor-pointer"
                      >
                        {post.title}
                      </Link>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-gray-700 font-medium">
                  {post.author}
                </TableCell>
                <TableCell className="text-gray-600">{post.category}</TableCell>
                <TableCell className="text-gray-600">{post.date}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                        ${
                          post.status === "Published"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : post.status === "Draft"
                            ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                            : post.status === "Scheduled"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-gray-50 text-gray-700 border-gray-200"
                        }
                      `}
                  >
                    {post.status}
                  </span>
                </TableCell>
                <TableCell className="text-gray-600">{post.views}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Footer / Pagination Placeholder */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs text-gray-500">
          <span>
            Showing 1 to {blogPosts.length} of {blogPosts.length} entries
          </span>
          <Pagination
            currentPage={currentPage}
            totalPages={5}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>
    </div>
  );
}
