import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    type?: 'website' | 'article' | 'profile';
    image?: string;
    schema?: any;
}

const SEO = ({ 
    title = 'GSIPP - Grupo de Segurança da Informação e Preservação da Privacidade', 
    description = 'Grupo de Excelência em Pesquisa da UFC especializado em segurança cibernética, criptografia, privacidade de dados e IoT.',
    type = 'website',
    image = 'https://gsipp.github.io/og-image.jpg', // Placeholder, update later
    schema 
}: SEOProps) => {
    const siteTitle = title.includes('GSIPP') ? title : `${title} | GSIPP`;

    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        "name": "GSIPP - Grupo de Segurança da Informação e Preservação da Privacidade",
        "url": "https://gsipp.github.io",
        "logo": "https://gsipp.github.io/logo.png",
        "parentOrganization": {
            "@type": "CollegeOrUniversity",
            "name": "Universidade Federal do Ceará",
            "url": "https://www.ufc.br"
        },
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Crateús",
            "addressRegion": "CE",
            "addressCountry": "BR"
        },
        "description": description
    };

    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{siteTitle}</title>
            <meta name="description" content={description} />
            
            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={siteTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={siteTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {/* Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify(schema || organizationSchema)}
            </script>
        </Helmet>
    );
};

export default SEO;
