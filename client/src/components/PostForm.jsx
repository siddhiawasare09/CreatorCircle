import { ArrowRight, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

const emptyValues = {
  title: "",
  description: "",
  mediaUrl: "",
  mediaType: "image",
  tags: "",
};

function PostForm({
  initialValues = emptyValues,
  onSubmit,
  onCancel,
  error,
  isSubmitting,
  submitLabel,
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: initialValues });

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  const submitForm = (values) => {
    const tags = values.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    return onSubmit({
      title: values.title.trim(),
      description: values.description.trim(),
      mediaUrl: values.mediaUrl.trim(),
      mediaType: values.mediaType,
      tags,
    });
  };

  return (
    <form className="post-form" onSubmit={handleSubmit(submitForm)} noValidate>
      {error && (
        <div className="form-alert" role="alert">
          {error}
        </div>
      )}
      <div className="post-form-grid">
        <div className="form-field">
          <label htmlFor="post-title">Title</label>
          <input
            id="post-title"
            maxLength={100}
            {...register("title", {
              required: "Enter a title.",
              maxLength: {
                value: 100,
                message: "Title must be 100 characters or fewer.",
              },
            })}
          />
          {errors.title && (
            <span className="field-error">{errors.title.message}</span>
          )}
        </div>
        <div className="form-field">
          <label htmlFor="post-media-type">Media type</label>
          <select id="post-media-type" {...register("mediaType")}>
            <option value="image">Image</option>
            <option value="video">Video</option>
            <option value="link">Link</option>
          </select>
        </div>
        <div className="form-field post-form-wide">
          <label htmlFor="post-media-url">Media URL</label>
          <input
            id="post-media-url"
            type="url"
            placeholder="https://example.com/your-work"
            {...register("mediaUrl", {
              required: "Enter a media URL.",
              validate: (value) => {
                try {
                  const url = new URL(value);
                  return (
                    ["http:", "https:"].includes(url.protocol) ||
                    "Enter a valid HTTP or HTTPS URL."
                  );
                } catch {
                  return "Enter a valid HTTP or HTTPS URL.";
                }
              },
            })}
          />
          {errors.mediaUrl && (
            <span className="field-error">{errors.mediaUrl.message}</span>
          )}
        </div>
        <div className="form-field post-form-wide">
          <label htmlFor="post-description">Description</label>
          <textarea
            id="post-description"
            rows="3"
            maxLength={1000}
            {...register("description", {
              maxLength: {
                value: 1000,
                message: "Description must be 1000 characters or fewer.",
              },
            })}
          />
          {errors.description && (
            <span className="field-error">{errors.description.message}</span>
          )}
        </div>
        <div className="form-field post-form-wide">
          <label htmlFor="post-tags">Tags</label>
          <input
            id="post-tags"
            placeholder="Branding, Illustration, Editorial"
            {...register("tags", {
              validate: (value) =>
                value
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean).length <= 5 ||
                "Add no more than 5 tags.",
            })}
          />
          <span className="field-hint">Separate up to 5 tags with commas.</span>
          {errors.tags && (
            <span className="field-error">{errors.tags.message}</span>
          )}
        </div>
      </div>
      <div className="post-form-actions">
        {onCancel && (
          <button
            className="button-outline"
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <X size={15} /> Cancel
          </button>
        )}
        <button
          className="button-primary"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving…" : submitLabel}
          {!isSubmitting && <ArrowRight size={15} />}
        </button>
      </div>
    </form>
  );
}

export default PostForm;
