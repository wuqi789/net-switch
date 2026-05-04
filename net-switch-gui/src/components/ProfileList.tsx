import type { Profile } from "../types";
import ProfileCard from "./ProfileCard";

interface ProfileListProps {
  profiles: Profile[];
  currentName: string;
  loading: boolean;
  onSwitch: (name: string) => void;
  onDryRun: (name: string) => Promise<string>;
}

export default function ProfileList({
  profiles,
  currentName,
  loading,
  onSwitch,
  onDryRun,
}: ProfileListProps) {
  if (profiles.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p className="text-lg mb-2">暂无 Profile</p>
        <p className="text-sm">请在配置文件中添加 Profile</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {profiles.map((profile) => (
        <ProfileCard
          key={profile.name}
          profile={profile}
          isActive={profile.name === currentName}
          loading={loading}
          onSwitch={onSwitch}
          onDryRun={onDryRun}
        />
      ))}
    </div>
  );
}
