import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll } from "framer-motion";
import { ChefHat, Users, BarChart3, Lock, Utensils, CreditCard, ShoppingBag, ArrowRight } from "lucide-react";
import LogoGolden from "../../assets/logo-golden.png";

const container = "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      className="fixed left-0 top-0 h-1 w-full bg-transparent z-[60]"
      style={{ transformOrigin: "0% 50%" }}
    >
      <motion.div
        className="h-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400"
        style={{ scaleX: scrollYProgress }}
      />
    </motion.div>
  );
}

function Section({ id, eyebrow, title, subtitle, children }) {
  return (
    <section id={id} className="py-24 relative">
      <motion.div
        className={container}
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        <motion.p
          variants={fadeUp}
          className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400"
        >
          {eyebrow}
        </motion.p>
        <motion.h2
          variants={fadeUp}
          className="mt-4 text-3xl md:text-5xl font-black bg-gradient-to-br from-white via-amber-50 to-amber-200 bg-clip-text text-transparent"
        >
          {title}
        </motion.h2>
        {subtitle && (
          <motion.p
            variants={fadeUp}
            className="mt-5 text-lg text-zinc-400 max-w-3xl leading-relaxed"
          >
            {subtitle}
          </motion.p>
        )}
        <motion.div variants={fadeUp} className="mt-12">
          {children}
        </motion.div>
      </motion.div>
    </section>
  );
}

function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4 }}
      className="group relative rounded-3xl border border-amber-500/10 bg-gradient-to-br from-zinc-900/90 to-black/50 
                 backdrop-blur-sm p-7 hover:border-amber-500/30 transition-all duration-500 overflow-hidden"
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-500/5 via-transparent to-transparent" />
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20">
            <Icon className="w-6 h-6 text-amber-400" />
          </div>
        </div>
        <h3 className="mt-5 text-white font-bold text-lg">{title}</h3>
        <p className="mt-3 text-sm text-zinc-400 leading-relaxed">{desc}</p>
        
        {/* Bottom accent line */}
        <div className="mt-6 h-[1px] w-0 group-hover:w-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 transition-all duration-700" />
      </div>
    </motion.div>
  );
}

function RoleCard({ role, points }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ scale: 1.02 }}
      className="rounded-3xl border border-amber-500/15 bg-gradient-to-br from-zinc-900/80 via-black/60 to-zinc-950/90 
                 backdrop-blur p-8 hover:border-amber-500/30 transition-all duration-300"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-600/10 
                        border border-amber-500/30 flex items-center justify-center">
          <div className="h-3 w-3 rounded-full bg-amber-400" />
        </div>
        <p className="text-white font-bold text-xl bg-gradient-to-r from-white to-amber-100 bg-clip-text text-transparent">
          {role}
        </p>
      </div>
      
      <ul className="space-y-3">
        {points.map((p) => (
          <li key={p} className="flex gap-3 items-start group/item">
            <div className="mt-1.5 h-2 w-2 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 
                            group-hover/item:scale-125 transition-transform" />
            <span className="text-sm text-zinc-300 group-hover/item:text-white transition-colors">{p}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function FAQItem({ q, a }) {
  return (
    <motion.details
      variants={fadeUp}
      className="group rounded-2xl border border-amber-500/10 bg-gradient-to-br from-zinc-900/60 to-black/40 
                 backdrop-blur p-6 hover:border-amber-500/25 transition-all duration-300"
    >
      <summary className="cursor-pointer select-none text-white font-semibold flex items-center justify-between">
        <span>{q}</span>
        <ArrowRight className="w-5 h-5 text-amber-400 group-open:rotate-90 transition-transform" />
      </summary>
      <p className="mt-4 text-sm text-zinc-400 leading-relaxed border-t border-amber-500/10 pt-4">
        {a}
      </p>
    </motion.details>
  );
}

export default function LandingPage() {
  const year = new Date().getFullYear();

  const features = useMemo(
    () => [
      {
        icon: ShoppingBag,
        title: "Order Management",
        desc: "Track orders end-to-end with clear statuses and fast workflows across roles.",
      },
      {
        icon: CreditCard,
        title: "Employee POS",
        desc: "Quick order creation for walk-ins and takeaway with a clean, efficient UI.",
      },
      {
        icon: ChefHat,
        title: "Kitchen Flow",
        desc: "Keep prep moving with focused views and status transitions that reduce confusion.",
      },
      {
        icon: Utensils,
        title: "Menu & Categories",
        desc: "Manage items, pricing, availability, and category organization.",
      },
      {
        icon: Users,
        title: "Table Management",
        desc: "Support dine-in operations with table selection and occupancy visibility.",
      },
      {
        icon: Lock,
        title: "Role-based Access",
        desc: "Separate flows for owner/admin/employee/customer so each user sees what they need.",
      },
      {
        icon: BarChart3,
        title: "Subscription Plans",
        desc: "Offer paid plans and manage access based on subscription status.",
      },
      {
        icon: Lock,
        title: "Secure Auth",
        desc: "JWT-based authentication with controlled access to protected endpoints.",
      },
    ],
    []
  );

  const faqs = useMemo(
    () => [
      {
        q: "Is Restauron suitable for small restaurants?",
        a: "Yes—Restauron is designed to be simple to start with, while still scaling as operations grow.",
      },
      {
        q: "Can I use it for dine-in and takeaway?",
        a: "Yes—features like POS and table flow are built to support both order types.",
      },
      {
        q: "How do I get started?",
        a: "Create an account, set up your restaurant, configure menu/tables, then begin taking orders.",
      },
      {
        q: "Is my data secure?",
        a: "We use industry-standard JWT authentication and secure endpoints to protect your restaurant data.",
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <ScrollProgress />

      {/* Enhanced background effects */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        {/* Primary glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[800px] 
                        bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.15),transparent_70%)] blur-3xl" />
        
        {/* Secondary accent */}
        <div className="absolute top-1/3 right-0 w-[600px] h-[600px] 
                        bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.1),transparent_65%)] blur-3xl" />
        
        {/* Bottom glow */}
        <div className="absolute bottom-0 left-0 w-[700px] h-[500px] 
                        bg-[radial-gradient(ellipse_at_center,rgba(217,119,6,0.12),transparent_70%)] blur-3xl" />
        
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(251,191,36,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(251,191,36,0.03)_1px,transparent_1px)] 
                        bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-amber-500/10 bg-black/40 backdrop-blur-xl">
        <div className={`${container} h-20 flex items-center justify-between`}>
          <Link to="/" className="flex items-center gap-3 group">
            <img src={LogoGolden} alt="Restauron" className="h-10 w-auto object-contain group-hover:scale-105 transition-transform" />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a className="text-zinc-400 hover:text-white transition-colors" href="#features">Features</a>
            <a className="text-zinc-400 hover:text-white transition-colors" href="#how">How it works</a>
            <a className="text-zinc-400 hover:text-white transition-colors" href="#roles">Roles</a>
            <a className="text-zinc-400 hover:text-white transition-colors" href="#faq">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden sm:inline-flex px-5 py-2.5 rounded-xl border border-amber-500/20 text-amber-100 
                         hover:text-white hover:border-amber-500/40 hover:bg-amber-500/5 transition-all font-medium"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="inline-flex px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 
                         text-black font-bold hover:from-amber-400 hover:to-yellow-500 transition-all 
                         shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-20 pb-28 relative">
        <div className={container}>
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="max-w-4xl"
          >
            <motion.div 
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/20 
                         bg-amber-500/5 backdrop-blur-sm mb-8"
            >
              <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                Restaurant operations, simplified
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl md:text-7xl font-black leading-[1.1] bg-gradient-to-br from-white via-amber-50 to-amber-200 bg-clip-text text-transparent"
            >
              Restaurant management made easy and affordable
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-8 text-xl text-zinc-300 max-w-2xl leading-relaxed"
            >
              Restauron helps teams manage menus, tables, orders, and daily workflows with role-based dashboards
              built for speed and simplicity.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                to="/signup"
                className="group inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl 
                           bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold text-lg
                           hover:from-amber-400 hover:to-yellow-500 transition-all 
                           shadow-xl shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-105"
              >
                Get started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-7 py-4 rounded-xl border-2 border-amber-500/30 
                           text-white font-semibold text-lg hover:border-amber-500/50 hover:bg-amber-500/5 transition-all"
              >
                Login
              </Link>
            </motion.div>

            {/* Mock preview */}
            <motion.div
              variants={fadeUp}
              className="mt-16 rounded-3xl border border-amber-500/20 bg-gradient-to-br from-zinc-900/80 via-black/60 to-zinc-950/90 
                         backdrop-blur-xl overflow-hidden shadow-2xl shadow-amber-500/10"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-red-500/70" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
                    <div className="h-3 w-3 rounded-full bg-green-500/70" />
                  </div>
                  <p className="text-sm font-semibold text-amber-400">Live Workflow Preview</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {["Pending", "Preparing", "Ready"].map((col, idx) => (
                    <div
                      key={col}
                      className="rounded-2xl border border-amber-500/15 bg-gradient-to-b from-zinc-900/60 to-black/40 p-5"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <div className={`h-2 w-2 rounded-full ${
                          idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-blue-400' : 'bg-green-400'
                        }`} />
                        <p className="text-sm font-bold text-white">{col}</p>
                      </div>
                      
                      <div className="space-y-3">
                        {[1, 2].map((i) => (
                          <div
                            key={`${col}-${i}`}
                            className="rounded-xl border border-amber-500/10 bg-zinc-900/40 p-4 hover:border-amber-500/25 transition-colors"
                          >
                            <p className="text-xs text-zinc-500 font-mono">#{col.slice(0, 1)}{i}24</p>
                            <p className="mt-2 text-sm text-white font-semibold">2 × Burger, 1 × Fries</p>
                            <p className="mt-2 text-xs text-zinc-400">Table 5 • Takeaway</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <Section
        id="features"
        eyebrow="Features"
        title="Everything your restaurant needs"
        subtitle="Core tools to run day-to-day operations without complexity."
      >
        <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} />
          ))}
        </motion.div>
      </Section>

      {/* How it works */}
      <Section
        id="how"
        eyebrow="How it works"
        title="Setup → Operate → Improve"
        subtitle="A simple flow that keeps staff fast and owners informed."
      >
        <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { num: "01", t: "Set up your restaurant", d: "Create your account, add restaurant details, and configure your menu." },
            { num: "02", t: "Start taking orders", d: "Employees create orders fast, kitchen processes them, statuses stay clear." },
            { num: "03", t: "Track performance", d: "Owners monitor operations and improve workflows using dashboard insights." },
          ].map((s) => (
            <motion.div
              key={s.t}
              variants={fadeUp}
              className="relative rounded-3xl border border-amber-500/15 bg-gradient-to-br from-zinc-900/70 to-black/50 
                         backdrop-blur p-8 hover:border-amber-500/30 transition-all group overflow-hidden"
            >
              <div className="absolute top-0 right-0 text-[120px] font-black text-amber-500/5 leading-none -mr-4 -mt-8 
                              group-hover:text-amber-500/10 transition-colors">
                {s.num}
              </div>
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl 
                                bg-gradient-to-br from-amber-500/20 to-yellow-600/10 border border-amber-500/30 mb-5">
                  <span className="text-amber-400 font-bold">{s.num}</span>
                </div>
                <p className="text-white font-bold text-lg mb-3">{s.t}</p>
                <p className="text-sm text-zinc-400 leading-relaxed">{s.d}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* Roles */}
      <Section
        id="roles"
        eyebrow="Built for teams"
        title="Role-based experiences"
        subtitle="Each role gets the right tools, with less clutter and fewer mistakes."
      >
        <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <RoleCard
            role="Owner"
            points={[
              "Manage menu, categories, availability",
              "Monitor operations and subscription",
              "Control restaurant settings",
            ]}
          />
          <RoleCard
            role="Employee"
            points={[
              "POS order creation",
              "Handle dine-in/takeaway flow",
              "Update order statuses quickly",
            ]}
          />
          <RoleCard
            role="Customer"
            points={[
              "Simple ordering experience",
              "Clear order tracking",
              "Clean, responsive UI",
            ]}
          />
          <RoleCard
            role="Admin"
            points={[
              "Platform oversight controls",
              "Manage subscription packages",
              "View payment history (internal)",
            ]}
          />
        </motion.div>
      </Section>

      {/* FAQ */}
      <Section
        id="faq"
        eyebrow="FAQ"
        title="Common questions"
        subtitle="Quick answers before you get started."
      >
        <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {faqs.map((f) => (
            <FAQItem key={f.q} q={f.q} a={f.a} />
          ))}
        </motion.div>

        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/signup"
            className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl 
                       bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold text-lg
                       hover:from-amber-400 hover:to-yellow-500 transition-all 
                       shadow-xl shadow-amber-500/30 hover:shadow-amber-500/50"
          >
            Create an account
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center px-7 py-4 rounded-xl border-2 border-amber-500/30 
                       text-white font-semibold text-lg hover:border-amber-500/50 hover:bg-amber-500/5 transition-all"
          >
            Login
          </Link>
        </div>
      </Section>

      {/* Footer */}
      <footer className="border-t border-amber-500/10 bg-gradient-to-b from-transparent to-zinc-950/50 backdrop-blur">
        <div className={`${container} py-12`}>
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
            <div>
              <img src={LogoGolden} alt="Restauron" className="h-10 w-auto object-contain mb-4" />
              <p className="text-sm text-zinc-500">
                © {year} Restauron. All rights reserved.
              </p>
            </div>

            <div className="flex flex-wrap gap-6 text-sm">
              <a className="text-zinc-400 hover:text-white transition-colors" href="#features">Features</a>
              <a className="text-zinc-400 hover:text-white transition-colors" href="#how">How it works</a>
              <a className="text-zinc-400 hover:text-white transition-colors" href="#roles">Roles</a>
              <a className="text-zinc-400 hover:text-white transition-colors" href="#faq">FAQ</a>
              <Link className="text-zinc-400 hover:text-white transition-colors" to="/login">Login</Link>
              <Link className="text-zinc-400 hover:text-white transition-colors" to="/signup">Sign up</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
