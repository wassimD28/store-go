"use client";
import { Button } from "@/client/components/ui/button";
import { Card, CardContent } from "@/client/components/ui/card";
import { Badge } from "@/client/components/ui/badge";
import { useDarkMode } from "@/client/store/darkMode.store";
import {
  Moon,
  Sun,
  Smartphone,
  Store,
  BarChart3,
  Zap,
  Shield,
  Globe,
  ArrowRight,
  CheckCircle,
  Play,
  Package,
  CreditCard,
  TrendingUp,
  Users,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import TextLogoIcon from "@/client/components/icons/textLogoIcon";

function Page() {
  const { darkMode, toggleDarkMode } = useDarkMode();

  const features = [
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: "Mobile App Generation",
      description:
        "Create fully-featured Flutter mobile apps for your store without any coding knowledge.",
    },
    {
      icon: <Store className="h-8 w-8" />,
      title: "Multi-Store Management",
      description:
        "Manage multiple stores with isolated customer bases from a single dashboard.",
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Real-time Analytics",
      description:
        "Track sales, customer behavior, and store performance with comprehensive analytics.",
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Live Updates",
      description:
        "Real-time progress tracking for app generation and instant notifications.",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Secure & Scalable",
      description:
        "Enterprise-grade security with JWT authentication and multi-tenant architecture.",
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Global Ready",
      description:
        "Support for multiple currencies, languages, and international payment methods.",
    },
  ];

  const steps = [
    {
      step: "1",
      title: "Create Your Store",
      description:
        "Set up your store profile, add products, and configure your brand settings.",
    },
    {
      step: "2",
      title: "Customize Your App",
      description:
        "Choose from pre-built templates and customize colors, layouts, and features.",
    },
    {
      step: "3",
      title: "Generate & Deploy",
      description:
        "Our AI generates your Flutter app and deploys it to app stores automatically.",
    },
    {
      step: "4",
      title: "Start Selling",
      description:
        "Your customers can download your app and start shopping immediately.",
    },
  ];

  const stats = [
    { value: "10k+", label: "Stores Created" },
    { value: "50k+", label: "Apps Generated" },
    { value: "99.9%", label: "Uptime" },
    { value: "24/7", label: "Support" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {" "}
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <TextLogoIcon className="h-8 w-auto" />
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => toggleDarkMode()}>
              {darkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-6">
              <Sparkles className="mr-2 h-4 w-4" />
              No-Code E-commerce Platform
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Create Your Own
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                {" "}
                Mobile Store{" "}
              </span>
              in Minutes
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-muted-foreground">
              Build professional Flutter mobile apps for your e-commerce
              business without writing a single line of code. Manage multiple
              stores, track analytics, and grow your business.
            </p>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" className="px-8 text-lg" asChild>
                <Link href="/sign-up">
                  Start Building Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 text-lg">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>

        {/* Background gradient */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-blue-600 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-t py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-primary lg:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold lg:text-4xl">
              Everything You Need to Build Your E-commerce Empire
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              Powerful features designed to help you create, manage, and scale
              your mobile commerce business.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group relative overflow-hidden transition-shadow hover:shadow-lg"
              >
                <CardContent className="p-6">
                  <div className="mb-4 text-primary">{feature.icon}</div>
                  <h3 className="mb-2 text-xl font-semibold">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold lg:text-4xl">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground">
              From concept to app store in just 4 simple steps
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  {step.step}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
                {index < steps.length - 1 && (
                  <ArrowRight className="mx-auto mt-4 hidden h-6 w-6 text-muted-foreground lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold lg:text-4xl">
                Why Choose StoreGo?
              </h2>
              <div className="space-y-4">
                {[
                  "No coding or technical skills required",
                  "Professional Flutter apps generated automatically",
                  "Real-time analytics and performance tracking",
                  "Secure payment processing with Stripe",
                  "Multi-store management from one dashboard",
                  "24/7 customer support and documentation",
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-500" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
              <Button size="lg" className="mt-8" asChild>
                <Link href="/sign-up">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            <div className="relative">
              <div className="rounded-2xl bg-gradient-to-r from-primary/20 to-blue-600/20 p-8">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <Package className="mb-2 h-8 w-8 text-primary" />
                    <div className="text-sm font-medium">Products</div>
                    <div className="text-2xl font-bold">2.5k+</div>
                  </Card>
                  <Card className="p-4">
                    <Users className="mb-2 h-8 w-8 text-primary" />
                    <div className="text-sm font-medium">Customers</div>
                    <div className="text-2xl font-bold">15k+</div>
                  </Card>
                  <Card className="p-4">
                    <CreditCard className="mb-2 h-8 w-8 text-primary" />
                    <div className="text-sm font-medium">Revenue</div>
                    <div className="text-2xl font-bold">$250k</div>
                  </Card>
                  <Card className="p-4">
                    <TrendingUp className="mb-2 h-8 w-8 text-primary" />
                    <div className="text-sm font-medium">Growth</div>
                    <div className="text-2xl font-bold">+180%</div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-20 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold lg:text-4xl">
            Ready to Build Your Mobile Store?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl opacity-90">
            Join thousands of successful store owners who have already created
            their mobile apps with StoreGo.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              variant="secondary"
              className="px-8 text-lg"
              asChild
            >
              <Link href="/sign-up">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground px-8 text-lg text-primary/50 hover:bg-primary-foreground hover:text-primary"
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          {" "}
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center space-x-2">
                <TextLogoIcon className="h-8 w-auto" />
              </div>
              <p className="text-muted-foreground">
                The easiest way to create professional mobile apps for your
                e-commerce business.
              </p>
            </div>

            <div>
              <h4 className="mb-4 font-semibold">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Templates
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    API
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Status
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-muted-foreground">
            <p>&copy; 2025 StoreGo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Page;
