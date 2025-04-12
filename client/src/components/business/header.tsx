import { User } from "@shared/schema";

interface BusinessHeaderProps {
  business: Omit<User, "password">;
  slug: string;
  currentPath: string;
}

export default function BusinessHeader({ business, slug, currentPath }: BusinessHeaderProps) {
  return (
    <header className="bg-white shadow">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center h-16">
          <div className="flex items-center">
            {/* Logo and Business Name */}
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-xl mr-3">
                {business.businessName?.substring(0, 1).toUpperCase() || "B"}
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                {business.businessName}
              </h1>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}