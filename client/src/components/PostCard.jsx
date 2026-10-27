import { ExternalLink, Pencil, Trash2 } from "lucide-react";

function PostCard({
  post,
  showActions = false,
  isDeleting = false,
  onEdit,
  onDelete,
}) {
  return (
    <article className="post-card">
      {post.mediaType === "image" ? (
        <a href={post.mediaUrl} target="_blank" rel="noreferrer">
          <img className="post-media" src={post.mediaUrl} alt={post.title} />
        </a>
      ) : post.mediaType === "video" ? (
        <video className="post-media" src={post.mediaUrl} controls>
          Your browser does not support video playback.
        </video>
      ) : (
        <a
          className="post-link-preview"
          href={post.mediaUrl}
          target="_blank"
          rel="noreferrer"
        >
          <ExternalLink size={22} />
          <span>Open project link</span>
        </a>
      )}
      <div className="post-card-content">
        <div className="post-card-heading">
          <h3>{post.title}</h3>
          {showActions && (
            <div className="post-card-actions">
              <button
                className="post-icon-button"
                type="button"
                onClick={() => onEdit(post)}
                aria-label={`Edit ${post.title}`}
              >
                <Pencil size={15} />
              </button>
              <button
                className="post-icon-button is-danger"
                type="button"
                onClick={() => onDelete(post)}
                disabled={isDeleting}
                aria-label={`Delete ${post.title}`}
              >
                <Trash2 size={15} />
              </button>
            </div>
          )}
        </div>
        {post.description && <p className="post-description">{post.description}</p>}
        {post.tags?.length > 0 && (
          <div className="post-tags" aria-label="Post tags">
            {post.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        )}
        <time className="post-date" dateTime={post.createdAt}>
          {new Date(post.createdAt).toLocaleDateString()}
        </time>
      </div>
    </article>
  );
}

export default PostCard;
