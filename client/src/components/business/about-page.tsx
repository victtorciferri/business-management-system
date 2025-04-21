import { User } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

interface AboutPageProps {
  business: Omit<User, "password">;
  slug: string;
}

export default function AboutPage({ business, slug }: AboutPageProps) {
  const { t } = useLanguage();
  
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{t('about.title')} {business.businessName || ''}</h1>
        
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>{t('about.our_story')}</CardTitle>
              <CardDescription>{t('about.story_subtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                {business.businessName} {t('about.story_part1')}
              </p>
              <p>
                {t('about.story_part2')}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t('about.our_mission')}</CardTitle>
              <CardDescription>{t('about.mission_subtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                {t('about.mission_text').replace('{businessName}', business.businessName || '')}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t('about.meet_team')}</CardTitle>
              <CardDescription>{t('about.team_subtitle')} {business.businessName}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-4xl font-bold text-gray-500">JD</span>
                  </div>
                  <h3 className="font-medium text-lg">John Davis</h3>
                  <p className="text-muted-foreground">Founder & Lead Stylist</p>
                </div>
                
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-4xl font-bold text-gray-500">SM</span>
                  </div>
                  <h3 className="font-medium text-lg">Sarah Miller</h3>
                  <p className="text-muted-foreground">Senior Stylist</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t('about.visit_us')}</CardTitle>
              <CardDescription>{t('about.visit_subtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="font-medium mb-2">{t('about.address')}</h3>
                  <p className="text-muted-foreground mb-1">123 Main Street</p>
                  <p className="text-muted-foreground mb-1">Midtown, New York</p>
                  <p className="text-muted-foreground">USA</p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">{t('about.hours')}</h3>
                  <div className="grid grid-cols-2 gap-x-4">
                    <p className="text-muted-foreground">{t('about.monday_friday')}</p>
                    <p>9:00 AM - 7:00 PM</p>
                    <p className="text-muted-foreground">{t('about.saturday')}</p>
                    <p>10:00 AM - 6:00 PM</p>
                    <p className="text-muted-foreground">{t('about.sunday')}</p>
                    <p>Closed</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-medium mb-2">{t('about.contact')}</h3>
                <p className="text-muted-foreground mb-1">{t('about.phone')} {business.phone || "(555) 123-4567"}</p>
                <p className="text-muted-foreground">{t('about.email')} contact@{business.businessSlug}.com</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}