import { Helmet } from 'react-helmet-async';
import { Mail, MessageSquare, HelpCircle } from 'lucide-react';
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

    return (
        <>
            <Helmet>
                <title>Support - EvidEx</title>
                <meta name="description" content="Get help with EvidEx. Contact support, view FAQ, and find answers to common questions." />
            </Helmet>

            <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
                {/* Header */}
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
                        How can we help?
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Get in touch with our support team or browse our FAQ
                    </p>
                </div>

                {/* Contact Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 max-w-4xl mx-auto">
                    <Card hover>
                        <CardContent className="p-8 text-center">
                            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                                <Mail className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Email Support</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Get help via email. We typically respond within 24 hours.
                            </p>
                            <a href="mailto:support@evidex.com">
                                <Button variant="outline" className="w-full">
                                    support@evidex.com
                                </Button>
                            </a>
                        </CardContent>
                    </Card>

                    <Card hover>
                        <CardContent className="p-8 text-center">
                            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                                <MessageSquare className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Contact Form</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Fill out our contact form and we'll get back to you soon.
                            </p>
                            <Button variant="outline" className="w-full">
                                Send Message
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Contact Form */}
                <section className="mb-16 max-w-2xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle>Send us a message</CardTitle>
                            <CardDescription>
                                Fill out the form below and we'll get back to you as soon as possible
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
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
                                        className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="your@email.com"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium mb-2">
                                        Subject
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="How can we help?"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                                        Message
                                    </label>
                                    <textarea
                                        id="message"
                                        rows={5}
                                        className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                        placeholder="Tell us more about your question or issue..."
                                    />
                                </div>
                                <Button type="submit" className="w-full">
                                    Send Message
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </section>

                {/* FAQ */}
                <section>
                    <div className="text-center mb-12">
                        <HelpCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                        <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
                        <p className="text-muted-foreground">
                            Quick answers to common questions
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {faqs.map((faq, index) => (
                            <Card key={index}>
                                <CardHeader>
                                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
}
