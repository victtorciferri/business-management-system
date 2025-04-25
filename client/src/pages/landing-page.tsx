import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Check, Calendar, Globe, BellRing, Users, Clock, Settings, BarChart, CreditCard, Palette, Bot, TrendingUp, Mail } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col antialiased bg-background text-foreground">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-purple-900 opacity-90 z-0"></div>
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block bg-white/10 backdrop-blur-sm px-4 py-1 rounded-full mb-4 border border-white/20">
              <span className="text-white/90 font-medium flex items-center gap-2 text-sm">
                <Bot className="h-4 w-4" /> AI-First Platform
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">AppointEase</h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Empowering SMEs in Chile with an intelligent, AI-driven appointment scheduling and customer engagement platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-indigo-900 hover:bg-white/90">
                <Link href="/auth">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Book a Demo
              </Button>
            </div>
          </div>
        </div>
        
        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="fill-background">
            <path d="M0,96L60,80C120,64,240,32,360,32C480,32,600,64,720,80C840,96,960,96,1080,88C1200,80,1320,64,1380,56L1440,48L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
          </svg>
        </div>
      </header>

      {/* Key Features Section */}
      <section className="py-20 container mx-auto px-4">
        <div className="max-w-xl mx-auto text-center mb-12">
          <div className="inline-flex items-center justify-center gap-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-4 py-1 rounded-full mb-4">
            <Bot className="h-4 w-4" /> 
            <span className="text-sm font-medium">Powered by AI at every level</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">AI-Driven Features</h2>
          <p className="text-xl text-muted-foreground">
            Our intelligent platform enhances every aspect of your business operations
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard 
            icon={<Bot className="h-8 w-8 text-indigo-600" />}
            title="Smart Booking Assistant" 
            description="AI-powered chatbot guides clients through bookings in real-time and answers questions naturally."
          />
          <FeatureCard 
            icon={<TrendingUp className="h-8 w-8 text-indigo-600" />}
            title="Predictive Analytics" 
            description="AI identifies demand peaks, risk of no-shows, and intelligently suggests upsell opportunities."
          />
          <FeatureCard 
            icon={<Calendar className="h-8 w-8 text-indigo-600" />}
            title="Intelligent Scheduling" 
            description="Advanced algorithms optimize your calendar and adapt to real-time availability."
          />
          <FeatureCard 
            icon={<Mail className="h-8 w-8 text-indigo-600" />}
            title="AI-Driven Marketing" 
            description="Automated campaigns based on client behavior patterns and personalized re-engagement."
          />
          <FeatureCard 
            icon={<Users className="h-8 w-8 text-indigo-600" />}
            title="Smart Client Profiles" 
            description="AI-enhanced profiles that learn from client interactions and predict preferences."
          />
          <FeatureCard 
            icon={<Globe className="h-8 w-8 text-indigo-600" />}
            title="Custom AI Domains" 
            description="White-labeled domains with intelligent content that adapts to visitor behavior."
          />
        </div>
      </section>

      {/* Advanced Features with Tabs */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="inline-block bg-gradient-to-r from-indigo-500 to-purple-500 p-px rounded-lg mb-6 mx-auto">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg px-4 py-2">
              <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent font-medium">
                Built for the AI generation
              </span>
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">AI-Powered Platform Technology</h2>
          <p className="text-xl text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
            Experience next-generation business tools built with artificial intelligence at their core
          </p>
          
          <Tabs defaultValue="business" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="business">Business Tools</TabsTrigger>
              <TabsTrigger value="customers">Customer Experience</TabsTrigger>
              <TabsTrigger value="ai">AI Capabilities</TabsTrigger>
            </TabsList>
            
            <TabsContent value="business" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col justify-center">
                  <h3 className="text-2xl font-bold mb-4">Powerful Business Management</h3>
                  <ul className="space-y-3">
                    <FeatureItem text="Client Profiles auto-generated on first booking" />
                    <FeatureItem text="Analytics Dashboard for business insights" />
                    <FeatureItem text="Mobile Accessibility for management on the go" />
                    <FeatureItem text="Theme Customization to match your brand" />
                    <FeatureItem text="Appointment Rescheduling & Cancellation tools" />
                  </ul>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                  <div className="p-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="font-bold text-lg">Dashboard Overview</h4>
                      <span className="text-sm text-muted-foreground">Today</span>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Upcoming Appointments</span>
                        <span className="font-medium">8</span>
                      </div>
                      <div className="flex justify-between">
                        <span>New Clients</span>
                        <span className="font-medium">3</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Revenue</span>
                        <span className="font-medium">$450</span>
                      </div>
                      <div className="h-32 bg-slate-100 dark:bg-slate-700 rounded-md flex items-center justify-center">
                        <BarChart className="h-16 w-16 text-slate-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="customers" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col justify-center">
                  <h3 className="text-2xl font-bold mb-4">Seamless Customer Experience</h3>
                  <ul className="space-y-3">
                    <FeatureItem text="No-login necessary booking experience" />
                    <FeatureItem text="Automated email & WhatsApp confirmations" />
                    <FeatureItem text="Self-service rescheduling and cancellations" />
                    <FeatureItem text="Digital receipts and appointment history" />
                    <FeatureItem text="Mobile-optimized booking interface" />
                  </ul>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                  <div className="p-1 bg-gradient-to-r from-teal-500 to-emerald-500"></div>
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="font-bold text-lg">Booking Experience</h4>
                      <span className="text-sm text-muted-foreground">Simple & Fast</span>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 h-8 w-8 rounded-full flex items-center justify-center">1</div>
                        <span>Select service</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 h-8 w-8 rounded-full flex items-center justify-center">2</div>
                        <span>Choose date & time</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 h-8 w-8 rounded-full flex items-center justify-center">3</div>
                        <span>Enter email</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 h-8 w-8 rounded-full flex items-center justify-center">4</div>
                        <span>Confirmation sent</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="ai" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col justify-center">
                  <h3 className="text-2xl font-bold mb-4">AI-Powered Features</h3>
                  <ul className="space-y-3">
                    <FeatureItem text="Smart Booking Assistant chatbot" />
                    <FeatureItem text="Predictive Analytics for demand forecasting" />
                    <FeatureItem text="AI-Driven Marketing Services" />
                    <FeatureItem text="Auto-segmented client campaigns" />
                    <FeatureItem text="Satisfaction surveys and insights" />
                  </ul>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                  <div className="p-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="font-bold text-lg">AI Assistant</h4>
                      <span className="text-sm text-muted-foreground">24/7 Support</span>
                    </div>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <div className="h-8 w-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                          <Bot className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg rounded-tl-none flex-grow">
                          <p className="text-sm">How can I help you book an appointment today?</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 justify-end">
                        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-lg rounded-tr-none max-w-[80%]">
                          <p className="text-sm">I need a haircut on Friday afternoon</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <div className="h-8 w-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                          <Bot className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg rounded-tl-none flex-grow">
                          <p className="text-sm">I found 3 available slots on Friday: 2:00 PM, 3:30 PM, and 4:45 PM. Which one works best for you?</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Simple, Fair Pricing</h2>
        <p className="text-xl text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
          No monthly fees — pay as you grow with our revenue-sharing model
        </p>
        
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg">
            <div className="p-2 bg-indigo-600"></div>
            <div className="p-6 md:p-8">
              <h3 className="text-2xl font-bold mb-4">Standard AI Plan</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">5%</span>
                <span className="text-muted-foreground"> revenue share</span>
              </div>
              <ul className="space-y-3 mb-8">
                <FeatureItem text="Custom domain for your business" />
                <FeatureItem text="AI-powered booking system" />
                <FeatureItem text="Smart automated reminders" /> 
                <FeatureItem text="AI-generated client profiles" />
                <FeatureItem text="Intelligent analytics" />
                <FeatureItem text="Secure payment processing" />
              </ul>
              <Button className="w-full" size="lg">
                Get Started
              </Button>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg relative">
            <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium px-3 py-1 rounded-bl-lg">
              Recommended
            </div>
            <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
            <div className="p-6 md:p-8">
              <h3 className="text-2xl font-bold mb-4">Advanced AI Plan</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">8%</span>
                <span className="text-muted-foreground"> revenue share</span>
              </div>
              <ul className="space-y-3 mb-8">
                <FeatureItem text="Everything in Standard AI Plan" />
                <FeatureItem text="Advanced AI booking assistant" />
                <FeatureItem text="Predictive analytics & deep insights" />
                <FeatureItem text="AI-driven WhatsApp integration" />
                <FeatureItem text="Intelligent marketing automation" />
                <FeatureItem text="AI-enhanced customer support" />
              </ul>
              <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700" size="lg">
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-900 to-purple-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1 rounded-full mb-4 border border-white/20">
            <Bot className="h-4 w-4" /> 
            <span className="text-sm font-medium">The Future is AI-First</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to transform your business with AI?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join hundreds of service businesses in Chile that are growing with AppointEase's intelligent platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-indigo-900 hover:bg-white/90">
              <Link href="/auth">Experience AI-Powered Scheduling</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Schedule a Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">AppointEase</h3>
              <p className="text-slate-400">
                Chile's first AI-powered platform empowering SMEs to succeed in the digital age with intelligent scheduling solutions.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">AI Features</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">AI Booking Assistant</a></li>
                <li><a href="#" className="hover:text-white">Intelligent Analytics</a></li>
                <li><a href="#" className="hover:text-white">Predictive Scheduling</a></li>
                <li><a href="#" className="hover:text-white">Smart Customer Insights</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 text-center text-slate-500">
            <p>© {new Date().getFullYear()} AppointEase. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Helper Components
const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => {
  return (
    <Card className="border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300 hover:shadow-md">
      <CardContent className="p-6">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

const FeatureItem: React.FC<{ text: string }> = ({ text }) => {
  return (
    <li className="flex items-start gap-2">
      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
      <span>{text}</span>
    </li>
  );
};

export default LandingPage;