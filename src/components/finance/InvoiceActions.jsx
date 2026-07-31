'use client';

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Printer, Download, Share2, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import styles from './InvoiceActions.module.css';

export const InvoiceActions = ({ targetRef, fileName = 'facture.pdf' }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const generatePDFBlob = async () => {
    if (!targetRef.current) return null;
    
    const canvas = await html2canvas(targetRef.current, {
      scale: 2, // Meilleure qualité
      useCORS: true,
      logging: false,
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    return pdf;
  };

  const handleDownloadPDF = async () => {
    try {
      setIsGenerating(true);
      const pdf = await generatePDFBlob();
      if (pdf) {
        pdf.save(fileName);
      }
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Une erreur est survenue lors de la création du PDF.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleWhatsAppShare = async () => {
    try {
      setIsGenerating(true);
      
      // Essayer d'utiliser l'API Web Share native (marche sur mobile Android/iOS pour les fichiers)
      if (navigator.share && navigator.canShare) {
        const pdf = await generatePDFBlob();
        if (!pdf) throw new Error("Erreur de référence cible");

        // Convertir le PDF en fichier (File object)
        const pdfBlob = pdf.output('blob');
        const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Facture SHALOM',
            text: 'Voici votre facture/reçu.',
            files: [file]
          });
          return; // Succès du partage natif
        }
      }

      // Fallback pour Desktop (WhatsApp Web ne supporte pas l'upload de fichier via URL)
      // On télécharge le fichier et on ouvre WhatsApp Web
      const pdf = await generatePDFBlob();
      if (pdf) {
        pdf.save(fileName);
      }
      
      const message = encodeURIComponent("Bonjour, voici ma facture générée depuis SHALOM. (Veuillez trouver le PDF téléchargé en pièce jointe).");
      window.open(`https://wa.me/?text=${message}`, '_blank');
      
    } catch (error) {
      console.error('Erreur lors du partage:', error);
      // Fallback simple si annulation ou échec
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={styles.actionsBar}>
      <Button variant="secondary" onClick={handlePrint} className="print-hide">
        <Printer size={18} />
        Imprimer
      </Button>
      
      <Button variant="primary" onClick={handleDownloadPDF} disabled={isGenerating} className="print-hide">
        {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
        Télécharger PDF
      </Button>
      
      <Button variant="outline" onClick={handleWhatsAppShare} disabled={isGenerating} style={{ borderColor: '#25D366', color: '#25D366' }} className="print-hide">
        <Share2 size={18} />
        Partager via WhatsApp
      </Button>
    </div>
  );
};
