import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { StoryData, StoryPage } from '../types';

export const generatePDFBlob = async (
    story: StoryData, 
    pages: StoryPage[], 
    bookSize: 'A4' | 'Square', 
    isRTL: boolean,
    onProgress?: (msg: string) => void
): Promise<Blob> => {
    // A4: 794 x 1123 px (at 96 DPI)
    // Square: 800 x 800 px
    const width = bookSize === 'A4' ? 794 : 800;
    const height = bookSize === 'A4' ? 1123 : 800;
    
    // Create a hidden container
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = `${width}px`;
    container.style.backgroundColor = '#f8fafc'; // Soft background
    container.style.color = '#0f172a';
    container.dir = isRTL ? 'rtl' : 'ltr';
    document.body.appendChild(container);

    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [width, height]
    });

    try {
        if (onProgress) onProgress(isRTL ? "جارٍ تجهيز الغلاف..." : "Preparing cover...");
        
        // --- PAGE 1: COVER ---
        container.innerHTML = `
            <div style="width: ${width}px; height: ${height}px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; box-sizing: border-box; background-color: #f8fafc;">
                <h1 style="font-family: ${isRTL ? "'Amiri', Arial" : "'Fredoka', Arial, sans-serif"}; font-size: 56px; text-align: center; margin-bottom: 50px; color: #1e293b; max-width: 90%; word-wrap: break-word;">
                    ${story.story_info.title}
                </h1>
                ${pages[0]?.generatedImage ? `<img src="data:image/jpeg;base64,${pages[0].generatedImage}" style="max-width: 80%; max-height: 50%; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);" />` : ''}
            </div>
        `;
        
        await new Promise(r => setTimeout(r, 100)); // wait for DOM update
        let canvas = await html2canvas(container, { scale: 2, useCORS: true, logging: false });
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.9), 'JPEG', 0, 0, width, height);

        // --- PAGE 2: INTRODUCTION ---
        if (onProgress) onProgress(isRTL ? "جارٍ تجهيز المقدمة..." : "Preparing introduction...");
        pdf.addPage();
        container.innerHTML = `
            <div style="width: ${width}px; height: ${height}px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px; box-sizing: border-box; background-color: #f8fafc;">
                <div style="font-family: ${isRTL ? "'Amiri', Arial" : "'Nunito', Arial, sans-serif"}; font-size: 36px; line-height: 1.8; text-align: center; color: #334155; max-width: 80%;">
                    ${isRTL ? "تم إنشاء هذه القصة لتنمية خيال الأطفال وإسعادهم." : "This story was created to inspire imagination and joy."}
                </div>
            </div>
        `;
        await new Promise(r => setTimeout(r, 100));
        canvas = await html2canvas(container, { scale: 2, useCORS: true, logging: false });
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.9), 'JPEG', 0, 0, width, height);

        // --- PAGE 3: TABLE OF CONTENTS ---
        if (onProgress) onProgress(isRTL ? "جارٍ تجهيز الفهرس..." : "Preparing table of contents...");
        pdf.addPage();
        const tocItems = pages.map((_, idx) => {
            return `<li style="margin-bottom: 20px; font-size: 26px; display: flex; justify-content: space-between; align-items: center;">
                        <span>${isRTL ? `المشهد ${idx + 1}` : `Scene ${idx + 1}`}</span>
                        <div style="flex-grow: 1; border-bottom: 2px dotted #cbd5e1; margin: 0 15px; position: relative; top: -6px;"></div>
                        <span>${isRTL ? `صفحة ${idx + 4}` : `Page ${idx + 4}`}</span>
                    </li>`;
        }).join('');
        
        container.innerHTML = `
            <div style="width: ${width}px; height: ${height}px; display: flex; flex-direction: column; padding: 80px 100px; box-sizing: border-box; background-color: #f8fafc;">
                <h2 style="font-family: ${isRTL ? "'Amiri', Arial" : "'Fredoka', Arial, sans-serif"}; font-size: 40px; margin-bottom: 50px; color: #1e293b; text-align: ${isRTL ? 'right' : 'left'}; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px;">
                    ${isRTL ? "المحتويات:" : "Contents:"}
                </h2>
                <ul style="list-style: none; padding: 0; margin: 0; font-family: ${isRTL ? "'Amiri', Arial" : "'Nunito', Arial, sans-serif"}; color: #475569; width: 100%;">
                    ${tocItems}
                </ul>
                <div style="margin-top: auto; padding-top: 40px; text-align: center; font-family: ${isRTL ? "'Amiri', Arial" : "'Nunito', Arial, sans-serif"}; font-size: 14px; color: #cbd5e1; line-height: 1.5;">
                    ${isRTL ? "تم إنشاء القصة باستخدام SawanKids" : "A story created using SawanKids"}
                </div>
            </div>
        `;
        await new Promise(r => setTimeout(r, 100));
        canvas = await html2canvas(container, { scale: 2, useCORS: true, logging: false });
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.9), 'JPEG', 0, 0, width, height);


        // --- PAGE 4+: STORY PAGES ---
        for (let i = 0; i < pages.length; i++) {
            if (onProgress) onProgress(isRTL ? `جارٍ تجهيز الصفحة ${i+1}...` : `Preparing page ${i+1}...`);
            
            pdf.addPage();
            container.innerHTML = `
                <div style="width: ${width}px; height: ${height}px; display: flex; flex-direction: column; padding: 60px 80px; box-sizing: border-box; background-color: #f8fafc; position: relative;">
                    ${pages[i].generatedImage ? `
                        <div style="height: 55%; display: flex; align-items: center; justify-content: center; margin-bottom: 40px;">
                            <img src="data:image/jpeg;base64,${pages[i].generatedImage}" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.12);" />
                        </div>
                    ` : '<div style="height: 55%; margin-bottom: 40px;"></div>'}
                    <div style="flex: 1; display: flex; flex-direction: column; justify-content: flex-start; align-items: center;">
                        <div style="font-family: ${isRTL ? "'Amiri', Arial" : "'Nunito', Arial, sans-serif"}; font-size: ${isRTL ? '36px' : '32px'}; line-height: 1.8; text-align: ${isRTL ? 'right' : 'left'}; color: #1e293b; max-width: 90%; white-space: pre-wrap;">${pages[i].text}</div>
                    </div>
                    <div style="position: absolute; bottom: 40px; left: 0; right: 0; text-align: center; font-family: sans-serif; font-size: 18px; color: #cbd5e1; font-weight: 600;">
                        ${i + 1}
                    </div>
                </div>
            `;
            await new Promise(r => setTimeout(r, 100));
            canvas = await html2canvas(container, { scale: 2, useCORS: true, logging: false });
            pdf.addImage(canvas.toDataURL('image/jpeg', 0.9), 'JPEG', 0, 0, width, height);
        }

        // --- FINAL PAGE: MORAL LESSONS (If applicable) ---
        if (story.story_info.lessons && story.story_info.lessons.length > 0) {
            if (onProgress) onProgress(isRTL ? "جارٍ تجهيز الخاتمة..." : "Preparing final page...");
            pdf.addPage();
            
            const moralItems = story.story_info.lessons.map(lesson => {
                return `<li style="margin-bottom: 24px; font-size: 28px; display: flex; align-items: center; gap: 15px;">
                            <span style="color: #6366f1;">•</span> ${lesson}
                        </li>`;
            }).join('');

            container.innerHTML = `
                <div style="width: ${width}px; height: ${height}px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px; box-sizing: border-box; background-color: #f8fafc;">
                    <div style="max-width: 80%; width: 100%; background: white; padding: 60px; border-radius: 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.05);">
                        <h2 style="font-family: ${isRTL ? "'Amiri', Arial" : "'Fredoka', Arial, sans-serif"}; font-size: 48px; margin-bottom: 50px; color: #1e293b; text-align: center;">
                            ${isRTL ? "ماذا تعلمنا من القصة؟" : "What did we learn?"}
                        </h2>
                        <ul style="list-style: none; padding: 0; margin: 0; font-family: ${isRTL ? "'Amiri', Arial" : "'Nunito', Arial, sans-serif"}; color: #475569; text-align: ${isRTL ? 'right' : 'left'};">
                            ${moralItems}
                        </ul>
                    </div>
                </div>
            `;
            await new Promise(r => setTimeout(r, 100));
            canvas = await html2canvas(container, { scale: 2, useCORS: true, logging: false });
            pdf.addImage(canvas.toDataURL('image/jpeg', 0.9), 'JPEG', 0, 0, width, height);
        }
    } finally {
        document.body.removeChild(container);
    }

    return pdf.output('blob');
};
