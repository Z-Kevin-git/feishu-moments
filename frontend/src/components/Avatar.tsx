interface AvatarProps {
  src?: string;
  name: string;
  size?: number;
}

export default function Avatar({ src, name, size = 40 }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }

  // 无头像时显示名字首字
  const initial = name.charAt(0).toUpperCase();
  const colors = ['#3370FF', '#7B67EE', '#F5A623', '#34C759', '#FF6B6B', '#00B8D9'];
  const color = colors[name.charCodeAt(0) % colors.length];

  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-medium flex-shrink-0"
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.4 }}
    >
      {initial}
    </div>
  );
}
