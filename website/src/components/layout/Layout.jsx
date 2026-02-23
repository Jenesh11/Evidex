import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }) {
    return (
        <div className="flex flex-col min-h-screen relative">
            <div className="noise-overlay" />
            <Header />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </div>
    );
}
