import Layout from "@/components/layout/header";
import { User } from "@shared/schema";

export default function DomainSetupInstructions() {
  // User context would normally come from authentication
  const currentUser: User = {
    id: 1,
    username: "businessowner",
    password: "password",
    email: "owner@example.com",
    businessName: "Salon Elegante",
    businessSlug: "salonelegante",
    customDomain: "salonelegante.cl",
    phone: "+56 9 9876 5432",
    createdAt: new Date()
  };
  
  return (
    <Layout currentUser={currentUser}>
      <div className="container max-w-4xl py-12">
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tighter">Custom Domain Setup Instructions</h1>
            <p className="text-lg text-muted-foreground">
              Follow these steps to connect your custom domain to your AppointEase business portal.
            </p>
          </div>

          <div className="bg-card rounded-lg shadow-sm p-6 border">
            <h2 className="text-2xl font-semibold mb-4">Step 1: Purchase a Domain</h2>
            <p className="mb-4">
              If you don't already own a domain, purchase one from a domain registrar such as:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>GoDaddy (godaddy.com)</li>
              <li>Namecheap (namecheap.com)</li>
              <li>Google Domains (domains.google)</li>
              <li>NIC Chile for .cl domains (nic.cl)</li>
            </ul>
            <div className="p-4 bg-muted rounded-md">
              <p className="text-sm">
                <strong>Note:</strong> For businesses in Chile, you may want to register a .cl domain through NIC Chile.
              </p>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-sm p-6 border">
            <h2 className="text-2xl font-semibold mb-4">Step 2: Access DNS Settings</h2>
            <p className="mb-4">
              Log in to your domain registrar account and locate the DNS management section for your domain.
              This is typically found under "DNS Settings," "DNS Management," or "Name Servers."
            </p>
            <div className="p-4 bg-muted rounded-md">
              <p className="text-sm">
                <strong>Tip:</strong> If you're unsure how to access DNS settings for your specific registrar, search for 
                "[your registrar name] DNS settings" for specific instructions.
              </p>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-sm p-6 border">
            <h2 className="text-2xl font-semibold mb-4">Step 3: Add DNS Records</h2>
            <p className="mb-4">
              You'll need to add either an A record or a CNAME record to point your domain to AppointEase.
            </p>

            <div className="mb-6 border-b pb-6">
              <h3 className="text-xl font-medium mb-3">Option A: Using a CNAME Record (Recommended)</h3>
              <p className="mb-4">
                A CNAME record is the easiest way to set up your custom domain. Add the following CNAME record:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border px-4 py-2 text-left">Record Type</th>
                      <th className="border px-4 py-2 text-left">Host/Name</th>
                      <th className="border px-4 py-2 text-left">Value/Points To</th>
                      <th className="border px-4 py-2 text-left">TTL</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border px-4 py-2">CNAME</td>
                      <td className="border px-4 py-2">@</td>
                      <td className="border px-4 py-2">appointease.com</td>
                      <td className="border px-4 py-2">3600 (or 1 hour)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Note: Some DNS providers don't allow CNAME records for the root domain (@). 
                In that case, use Option B or set up a subdomain like "www" instead.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-3">Option B: Using A Records</h3>
              <p className="mb-4">
                If CNAME doesn't work for your domain, add the following A records:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border px-4 py-2 text-left">Record Type</th>
                      <th className="border px-4 py-2 text-left">Host/Name</th>
                      <th className="border px-4 py-2 text-left">Value/Points To</th>
                      <th className="border px-4 py-2 text-left">TTL</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border px-4 py-2">A</td>
                      <td className="border px-4 py-2">@</td>
                      <td className="border px-4 py-2">203.0.113.1</td>
                      <td className="border px-4 py-2">3600 (or 1 hour)</td>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2">A</td>
                      <td className="border px-4 py-2">www</td>
                      <td className="border px-4 py-2">203.0.113.1</td>
                      <td className="border px-4 py-2">3600 (or 1 hour)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-sm p-6 border">
            <h2 className="text-2xl font-semibold mb-4">Step 4: Update Your AppointEase Profile</h2>
            <p className="mb-4">
              After setting up your DNS records, you need to add your custom domain to your AppointEase profile:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Log in to your AppointEase business account</li>
              <li>Go to Settings &gt; Business Profile</li>
              <li>Enter your custom domain in the "Custom Domain" field</li>
              <li>Click "Save Changes"</li>
            </ol>
          </div>

          <div className="bg-card rounded-lg shadow-sm p-6 border">
            <h2 className="text-2xl font-semibold mb-4">Step 5: Wait for DNS Propagation</h2>
            <p className="mb-4">
              DNS changes can take up to 48 hours to propagate worldwide, but typically complete within a few hours.
              Once propagation is complete, your custom domain will direct to your AppointEase business portal.
            </p>
            <div className="p-4 bg-muted rounded-md">
              <p className="text-sm">
                <strong>Troubleshooting:</strong> If your domain isn't working after 48 hours, verify your DNS settings
                are correct and contact your domain registrar for assistance. You can also contact AppointEase support
                at support@appointease.com for help.
              </p>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-sm p-6 border">
            <h2 className="text-2xl font-semibold mb-4">Common Questions</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Can I use a subdomain instead of my root domain?</h3>
                <p>
                  Yes! You can use a subdomain like "booking.yourdomain.com" by creating a CNAME record for the 
                  subdomain pointing to appointease.com.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Will my existing website be affected?</h3>
                <p>
                  If you're using your domain for an existing website, setting up a subdomain for AppointEase 
                  is recommended to avoid disrupting your main website.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Is SSL/HTTPS included?</h3>
                <p>
                  Yes! AppointEase automatically provides SSL certificates for all custom domains to ensure 
                  your customers' data remains secure.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center pt-4">
            <p className="text-muted-foreground">
              Need more help? Contact our support team at{" "}
              <a href="mailto:support@appointease.com" className="text-primary hover:underline">
                support@appointease.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}