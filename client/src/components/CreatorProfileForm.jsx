import { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";

const emptyValues = {
  name: "",
  profileImage: "",
  bio: "",
  category: "",
  skills: "",
  location: "",
  instagram: "",
  linkedin: "",
  youtube: "",
  website: "",
};

function CreatorProfileForm({
  initialValues = emptyValues,
  onSubmit,
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
    const skills = values.skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    onSubmit({
      name: values.name.trim(),
      profileImage: values.profileImage.trim(),
      bio: values.bio.trim(),
      category: values.category.trim(),
      skills,
      location: values.location.trim(),
      socialLinks: {
        instagram: values.instagram.trim(),
        linkedin: values.linkedin.trim(),
        youtube: values.youtube.trim(),
        website: values.website.trim(),
      },
    });
  };

  return (
    <form
      className="creator-form"
      onSubmit={handleSubmit(submitForm)}
      noValidate
    >
      {error && (
        <div className="form-alert" role="alert">
          {error}
        </div>
      )}
      <div className="creator-form-grid">
        <div className="form-field">
          <label htmlFor="creator-name">Name</label>
          <input
            id="creator-name"
            placeholder="Your public creator name"
            {...register("name", { required: "Name is required." })}
          />
          {errors.name && (
            <span className="field-error">{errors.name.message}</span>
          )}
        </div>
        <div className="form-field">
          <label htmlFor="creator-category">Category</label>
          <input
            id="creator-category"
            placeholder="e.g. Photography, Design"
            {...register("category", { required: "Category is required." })}
          />
          {errors.category && (
            <span className="field-error">{errors.category.message}</span>
          )}
        </div>
        <div className="form-field creator-form-wide">
          <label htmlFor="creator-profile-image">Profile Image URL</label>
          <input
            id="creator-profile-image"
            type="url"
            placeholder="https://example.com/your-photo.jpg"
            {...register("profileImage")}
          />
          <span className="field-hint">Optional. Paste a publicly accessible image URL.</span>
        </div>
        <div className="form-field creator-form-wide">
          <label htmlFor="creator-bio">Bio</label>
          <textarea
            id="creator-bio"
            rows="4"
            placeholder="Tell collaborators what you create and what you enjoy working on."
            {...register("bio", { required: "Bio is required." })}
          />
          {errors.bio && (
            <span className="field-error">{errors.bio.message}</span>
          )}
        </div>
        <div className="form-field">
          <label htmlFor="creator-skills">Skills</label>
          <input
            id="creator-skills"
            placeholder="UI Design, Branding, Illustration"
            {...register("skills")}
          />
          <span className="field-hint">Separate skills with commas.</span>
        </div>
        <div className="form-field">
          <label htmlFor="creator-location">Location</label>
          <input
            id="creator-location"
            placeholder="City or region"
            {...register("location")}
          />
        </div>
      </div>

      <fieldset className="social-fields">
        <legend>Social links</legend>
        <div className="creator-form-grid">
          <div className="form-field">
            <label htmlFor="creator-instagram">Instagram</label>
            <input
              id="creator-instagram"
              type="url"
              placeholder="https://instagram.com/you"
              {...register("instagram")}
            />
          </div>
          <div className="form-field">
            <label htmlFor="creator-linkedin">LinkedIn</label>
            <input
              id="creator-linkedin"
              type="url"
              placeholder="https://linkedin.com/in/you"
              {...register("linkedin")}
            />
          </div>
          <div className="form-field">
            <label htmlFor="creator-youtube">YouTube</label>
            <input
              id="creator-youtube"
              type="url"
              placeholder="https://youtube.com/@you"
              {...register("youtube")}
            />
          </div>
          <div className="form-field">
            <label htmlFor="creator-website">Website</label>
            <input
              id="creator-website"
              type="url"
              placeholder="https://your-portfolio.com"
              {...register("website")}
            />
          </div>
        </div>
      </fieldset>

      <div className="creator-form-actions">
        <button
          className="button-primary"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving…" : submitLabel}
          {!isSubmitting && <ArrowRight size={16} />}
        </button>
      </div>
    </form>
  );
}

export default CreatorProfileForm;
