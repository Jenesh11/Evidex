import { Helmet } from 'react-helmet-async';
import { Mail, MessageSquare, HelpCircle, Send, Phone, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';

export default function Support() {
    const faqs = [
        {
            question: 'How do I activate my license?',
            answer: 'Go to the Pricing page in the app, enter your license code, and click "Claim License". Your subscription will be activated immediately.',
        },
        {
            question: 'Can I use EvidEx on multiple computers?',
            answer: 'Each license is valid for one computer. Contact us for multi-device licensing options.',
        },
        {
            question: 'How do I backup my data?',
            answer: 'Pro users have automatic backups enabled. Starter users can manually create backups from the Settings page.',
        },
        {
            question: 'What if a video shows as tampered?',
            answer: 'If a video file is modified after recording, EvidEx will detect it and mark it as invalid. The original hash is stored in the database for verification.',
        },
        {
            question: 'Can I export my data?',
            answer: 'Yes, you can export evidence packages as ZIP files (Pro plan) or manually backup your database from Settings.',
        },
        {
            question: 'Do you offer training or onboarding?',
            answer: 'Pro plan users get priority support. Contact us for personalized training sessions.',
        },
    ];

    const contactOptions = [
        {
            icon: Mail,
            title: 'Email Support',
            description: 'Get help via email. We typically respond within 24 hours.',
            action: 'support@evidex.in',
            href: 'mailto:support@evidex.in',
            gradient: 'from-blue-500 to-cyan-500',
        },
        {
            icon: Phone,
            title: 'Phone Support',
            description: 'Talk to our support team directly during business hours.',
            action: 'Call Us',
            gradient: 'from-green-500 to-emerald-500',
        },
        {
            icon: Clock,
            title: 'Live Chat',
            description: 'Chat with our team in real-time for quick assistance.',
            action: 'Start Chat',
            gradient: 'from-purple-500 to-pink-500',
        },
    ];

    return (
        <>
            <Helmet>
                <title>Support - EvidEx</title>
                <meta name="description" content="Get help with EvidEx. Contact support, view FAQ, and find answers to common questions." />
            </Helmet>

            <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
                {/* Header */}
                <div className="mx-auto max-w-2xl text-center mb-16 animate-fade-in">
                    <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
                        How can we <span className="gradient-text">help?</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-muted-foreground">
                        Get in touch with our support team or browse our FAQ
                    </p>
                </div>

                {/* Contact Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-6xl mx-auto">
                    {contactOptions.map((option, index) => (
                        <Card
                            key={index}
                            className="card-hover card-glow group animate-fade-in"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <CardContent className="p-8 text-center">
                                <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${option.gradient} mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    <option.icon className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3">{option.title}</h3>
                                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                                    {option.description}
                                </p>
                                {option.href ? (
                                    <a href={option.href}>
                                        <Button variant="outline" className="w-full hover:bg-primary/10">
                                            {option.action}
                                        </Button>
                                    </a>
                                ) : (
                                    <Button variant="outline" className="w-full hover:bg-primary/10">
                                        {option.action}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Contact Form */}
                <section className="mb-16 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <Card className="card-hover card-glow">
                        <CardHeader>
                            <CardTitle className="text-2xl">Send us a message</CardTitle>
                            <CardDescription className="text-base">
                                Fill out the form below and we'll get back to you as soon as possible
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium mb-2">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                            placeholder="Your name"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium mb-2">
                                        Subject
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                        placeholder="How can we help?"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                                        Message
                                    </label>
                                    <textarea
                                        id="message"
                                        rows={6}
                                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none transition-all"
                                        placeholder="Tell us more about your question or issue..."
                                    />
                                </div>
                                <Button type="submit" className="w-full btn-gradient btn-glow" size="lg">
                                    <Send className="mr-2 h-5 w-5" />
                                    Send Message
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </section>

                {/* FAQ */}
                <section className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <div className="text-center mb-12">
                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 mx-auto mb-6 shadow-lg">
                            <HelpCircle className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold mb-4">
                            Frequently Asked <span className="gradient-text">Questions</span>
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            Quick answers to common questions
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {faqs.map((faq, index) => (
                            <Card key={index} className="card-hover">
                                <CardHeader>
                                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
}
