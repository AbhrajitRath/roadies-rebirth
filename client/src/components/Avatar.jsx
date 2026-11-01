export default function Avatar({ name, photo, accent, size = 44 }) {
  const initials = name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <span className="av" style={{ width: size, height: size, "--ac": accent || "#ff8a1f", fontSize: size * 0.36 }}>
      {photo ? <img src={photo} alt="" loading="lazy" /> : initials}
    </span>
  );
}
