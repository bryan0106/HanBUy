"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate, formatDateTime } from "@/lib/utils";

interface SocialPost {
  id: string;
  itemName: string;
  platform: "facebook" | "instagram" | "twitter";
  status: "draft" | "scheduled" | "posted";
  content: string;
  scheduledDate?: Date;
  postedDate?: Date;
  createdAt: Date;
}

export default function SocialMediaPage() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadPosts();
  }, [platformFilter, statusFilter]);

  const loadPosts = async () => {
    setLoading(true);
    // TODO: Fetch from API
    const mockData: SocialPost[] = [
      {
        id: "post-1",
        itemName: "COSRX Advanced Snail 96 Mucin Power Essence",
        platform: "facebook",
        status: "scheduled",
        content: "New arrival! Get your K-beauty essentials...",
        scheduledDate: new Date("2024-12-31T10:00:00"),
        createdAt: new Date("2024-12-28"),
      },
      {
        id: "post-2",
        itemName: "Samyang Buldak Hot Chicken Ramen",
        platform: "instagram",
        status: "posted",
        content: "Spicy Korean noodles now available! 🔥",
        postedDate: new Date("2024-12-27T14:00:00"),
        createdAt: new Date("2024-12-26"),
      },
      {
        id: "post-3",
        itemName: "Laneige Water Bank Hyaluronic Cream",
        platform: "twitter",
        status: "draft",
        content: "Hydrate your skin with Laneige...",
        createdAt: new Date("2024-12-29"),
      },
    ];
    setPosts(mockData);
    setLoading(false);
  };

  const filteredPosts = posts.filter((post) => {
    if (platformFilter !== "all" && post.platform !== platformFilter) return false;
    if (statusFilter !== "all" && post.status !== statusFilter) return false;
    return true;
  });

  const platformColors: Record<string, string> = {
    facebook: "bg-blue-600",
    instagram: "bg-pink-600",
    twitter: "bg-blue-400",
  };

  const statusColors: Record<string, string> = {
    draft: "bg-grey-100 text-grey-700",
    scheduled: "bg-warning/10 text-warning",
    posted: "bg-success/10 text-success",
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Social Media Management</h1>
        <Link
          href="/admin/social/new"
          className="rounded-lg bg-soft-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-soft-blue-700"
        >
          + Schedule Post
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Posts</p>
          <p className="text-2xl font-bold">{posts.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Scheduled</p>
          <p className="text-2xl font-bold text-warning">
            {posts.filter((p) => p.status === "scheduled").length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Posted</p>
          <p className="text-2xl font-bold text-success">
            {posts.filter((p) => p.status === "posted").length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Drafts</p>
          <p className="text-2xl font-bold">
            {posts.filter((p) => p.status === "draft").length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Platform</label>
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="rounded-lg border border-border bg-background px-4 py-2"
          >
            <option value="all">All Platforms</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="twitter">Twitter</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-border bg-background px-4 py-2"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="posted">Posted</option>
          </select>
        </div>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading posts...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="rounded-lg border border-border bg-card p-6"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium text-white ${
                        platformColors[post.platform] || "bg-grey-600"
                      }`}
                    >
                      {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}
                    </span>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        statusColors[post.status] || "bg-grey-100 text-grey-700"
                      }`}
                    >
                      {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                    </span>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{post.itemName}</h3>
                  <p className="mb-4 text-muted-foreground">{post.content}</p>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>Created: {formatDate(post.createdAt)}</span>
                    {post.scheduledDate && (
                      <span>Scheduled: {formatDateTime(post.scheduledDate)}</span>
                    )}
                    {post.postedDate && (
                      <span>Posted: {formatDateTime(post.postedDate)}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {post.status === "draft" && (
                    <button className="rounded-lg bg-soft-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-soft-blue-700">
                      Schedule
                    </button>
                  )}
                  {post.status === "scheduled" && (
                    <button className="rounded-lg bg-success px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-success/90">
                      Publish Now
                    </button>
                  )}
                  <Link
                    href={`/admin/social/${post.id}/edit`}
                    className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold transition-colors hover:bg-grey-50"
                  >
                    Edit
                  </Link>
                  <button className="rounded-lg border border-error bg-error/10 px-4 py-2 text-sm font-semibold text-error transition-colors hover:bg-error/20">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

