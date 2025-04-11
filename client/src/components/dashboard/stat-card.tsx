import { ReactNode } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  linkText?: string;
  linkHref?: string;
  linkOnClick?: () => void;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  iconBgColor,
  iconColor,
  linkText,
  linkHref,
  linkOnClick
}: StatCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${iconBgColor} rounded-md p-3`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <div className="text-sm font-medium text-gray-500 truncate">{title}</div>
            <div className="text-lg font-medium text-gray-900 mt-1">{value}</div>
          </div>
        </div>
      </CardContent>
      {(linkText && (linkHref || linkOnClick)) && (
        <CardFooter className="bg-gray-50 px-6 py-3">
          <div className="text-sm">
            {linkHref ? (
              <a 
                href={linkHref} 
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                {linkText}
              </a>
            ) : (
              <button 
                onClick={linkOnClick} 
                className="font-medium text-primary-600 hover:text-primary-500 text-left"
              >
                {linkText}
              </button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
