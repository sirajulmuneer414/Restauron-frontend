import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll } from "framer-motion";

const container = "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

function ScrollProgress() {
  const { scrollYProgress } = useScroll(); // scroll-linked motion value [web:248]
  return (
    <motion.div
      className="fixed left-0 top-0 h-[2px] w-full bg-transparent z-[60]"
      style={{ transformOrigin: "0% 50%" }}
    >
      <motion.div
        className="h-full bg-gradient-to-r from-yellow-300 via-yellow-500 to-amber-600"
        style={{ scaleX: scrollYProgress }}
      />
    </motion.div>
  );
}

function Section({ id, eyebrow, title, subtitle, children }) {
  return (
    <section id={id} className="py-20">
      <motion.div
        className={container}
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }} // scroll-triggered reveal [web:236]
      >
        <motion.p
          variants={fadeUp}
          className="text-xs uppercase tracking-[0.25em] text-yellow-400/90"
        >
          {eyebrow}
        </motion.p>
        <motion.h2
          variants={fadeUp}
          className="mt-3 text-3xl md:text-4xl font-extrabold text-white"
        >
          {title}
        </motion.h2>
        {subtitle ? (
          <motion.p
            variants={fadeUp}
            className="mt-4 text-white/70 max-w-2xl"
          >
            {subtitle}
          </motion.p>
        ) : null}

        <motion.div variants={fadeUp} className="mt-10">
          {children}
        </motion.div>
      </motion.div>
    </section>
  );
}

function FeatureCard({ title, desc }) {
  return (
    <motion.div
      variants={fadeUp}
      className="group rounded-2xl border border-yellow-500/15 bg-white/[0.03]
                 p-6 hover:bg-white/[0.05] transition-colors"
    >
      <div className="flex items-center justify-between">
        <p className="text-white font-semibold">{title}</p>
        <span className="h-8 w-8 rounded-xl bg-yellow-500/10 border border-yellow-500/20" />
      </div>
      <p className="mt-3 text-sm text-white/70 leading-relaxed">{desc}</p>
      <div className="mt-5 h-[2px] w-0 group-hover:w-full bg-gradient-to-r from-yellow-400 to-amber-600 transition-all duration-500" />
    </motion.div>
  );
}

function RoleCard({ role, points }) {
  return (
    <motion.div
      variants={fadeUp}
      className="rounded-2xl border border-yellow-500/15 bg-black/40 p-6"
    >
      <p className="text-white font-bold text-lg">{role}</p>
      <ul className="mt-4 space-y-2 text-sm text-white/75">
        {points.map((p) => (
          <li key={p} className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-yellow-400" />
            <span>{p}</span>
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
      className="rounded-2xl border border-yellow-500/15 bg-white/[0.03] p-5"
    >
      <summary className="cursor-pointer select-none text-white font-semibold">
        {q}
      </summary>
      <p className="mt-3 text-sm text-white/70 leading-relaxed">{a}</p>
    </motion.details>
  );
}

export default function LandingPage() {
  const year = new Date().getFullYear();

  const features = useMemo(
    () => [
      {
        title: "Order Management",
        desc: "Track orders end-to-end with clear statuses and fast workflows across roles.",
      },
      {
        title: "Employee POS",
        desc: "Quick order creation for walk-ins and takeaway with a clean, efficient UI.",
      },
      {
        title: "Kitchen Flow",
        desc: "Keep prep moving with focused views and status transitions that reduce confusion.",
      },
      {
        title: "Menu & Categories",
        desc: "Manage items, pricing, availability, and category organization.",
      },
      {
        title: "Table Management",
        desc: "Support dine-in operations with table selection and occupancy visibility.",
      },
      {
        title: "Role-based Access",
        desc: "Separate flows for owner/admin/employee/customer so each user sees what they need.",
      },
      {
        title: "Subscription Plans",
        desc: "Offer paid plans and manage access based on subscription status.",
      },
      {
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
    ],
    []
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <ScrollProgress />

      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full blur-3xl opacity-25
                        bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.35),rgba(0,0,0,0))]" />
        <div className="absolute bottom-[-240px] right-[-200px] h-[520px] w-[520px] rounded-full blur-3xl opacity-20
                        bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.35),rgba(0,0,0,0))]" />
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur border-b border-white/10 bg-black/60">
        <div className={`${container} h-16 flex items-center justify-between`}>
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-yellow-500/10 border border-yellow-500/20" />
            <span className="font-extrabold tracking-wide">Restauron</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-white/70">
            <a className="hover:text-white" href="#features">Features</a>
            <a className="hover:text-white" href="#how">How it works</a>
            <a className="hover:text-white" href="#roles">Roles</a>
            <a className="hover:text-white" href="#faq">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden sm:inline-flex px-4 py-2 rounded-xl border border-white/15 text-white/90 hover:text-white hover:border-white/25 transition"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="inline-flex px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-600 text-black font-semibold hover:brightness-110 transition"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-16 pb-20">
        <div className={container}>
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            <motion.p
              variants={fadeUp}
              className="text-xs uppercase tracking-[0.25em] text-yellow-400/90"
            >
              Restaurant operations, simplified
            </motion.p>

            <motion.h1
              variants={fadeUp}
              className="mt-5 text-4xl md:text-6xl font-extrabold leading-tight"
            >
              Restaurant management made easy and affordable
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 text-white/70 max-w-2xl leading-relaxed"
            >
              Restauron helps teams manage menus, tables, orders, and daily workflows with role-based dashboards
              built for speed.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to="/signup"
                className="inline-flex justify-center px-5 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-600 text-black font-bold hover:brightness-110 transition"
              >
                Get started
              </Link>
              <Link
                to="/login"
                className="inline-flex justify-center px-5 py-3 rounded-xl border border-white/15 text-white hover:border-white/25 transition"
              >
                Login
              </Link>
              <a
                href="#features"
                className="inline-flex justify-center px-5 py-3 rounded-xl border border-yellow-500/20 text-yellow-200 hover:text-yellow-100 hover:border-yellow-500/35 transition"
              >
                Explore features
              </a>
            </motion.div>

            {/* Mock preview */}
            <motion.div
              variants={fadeUp}
              className="mt-12 rounded-3xl border border-yellow-500/15 bg-white/[0.03] overflow-hidden"
            >
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between">
                  <p className="text-white font-semibold">Live Workflow Preview</p>
                  <div className="flex gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {["Pending", "Preparing", "Ready"].map((col) => (
                    <div
                      key={col}
                      className="rounded-2xl border border-white/10 bg-black/40 p-4"
                    >
                      <p className="text-sm font-semibold text-white">{col}</p>
                      <div className="mt-3 space-y-3">
                        {[1, 2].map((i) => (
                          <div
                            key={`${col}-${i}`}
                            className="rounded-xl border border-yellow-500/10 bg-white/[0.03] p-3"
                          >
                            <p className="text-xs text-white/60">Order #{col.slice(0, 1)}{i}24</p>
                            <p className="mt-1 text-sm text-white font-semibold">2 × Burger, 1 × Fries</p>
                            <p className="mt-1 text-xs text-white/60">Table 5 • Takeaway</p>
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
        <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => (
            <FeatureCard key={f.title} title={f.title} desc={f.desc} />
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
        <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { t: "Set up your restaurant", d: "Create your account, add restaurant details, and configure your menu." },
            { t: "Start taking orders", d: "Employees create orders fast, kitchen processes them, statuses stay clear." },
            { t: "Track performance", d: "Owners monitor operations and improve workflows using dashboard insights." },
          ].map((s) => (
            <motion.div
              key={s.t}
              variants={fadeUp}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
            >
              <p className="text-white font-bold">{s.t}</p>
              <p className="mt-2 text-sm text-white/70">{s.d}</p>
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
        <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((f) => (
            <FAQItem key={f.q} q={f.q} a={f.a} />
          ))}
        </motion.div>

        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <Link
            to="/signup"
            className="inline-flex justify-center px-5 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-600 text-black font-bold hover:brightness-110 transition"
          >
            Create an account
          </Link>
          <Link
            to="/login"
            className="inline-flex justify-center px-5 py-3 rounded-xl border border-white/15 text-white hover:border-white/25 transition"
          >
            Login
          </Link>
        </div>
      </Section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className={`${container} py-10 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between`}>
          <div>
            <p className="text-white font-semibold">Restauron</p>
            <p className="text-sm text-white/60 mt-1">
              © {year} Restauron. All rights reserved.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-white/70">
            <a className="hover:text-white" href="#features">Features</a>
            <a className="hover:text-white" href="#how">How it works</a>
            <a className="hover:text-white" href="#roles">Roles</a>
            <a className="hover:text-white" href="#faq">FAQ</a>
            <Link className="hover:text-white" to="/login">Login</Link>
            <Link className="hover:text-white" to="/signup">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
