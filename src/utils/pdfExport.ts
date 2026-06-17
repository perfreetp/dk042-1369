import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import type { PortfolioData, AbilityGap } from '../types';
import { calculateOverallScore } from './diagnosis';

export async function exportToPDF(
  data: PortfolioData,
  abilityGaps: AbilityGap[],
  elementId?: string
): Promise<void> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  if (elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      await exportElementToPDF(element);
      return;
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('作品集诊断报告', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`生成日期：${new Date().toLocaleDateString('zh-CN')}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;

  const overallScore = calculateOverallScore(abilityGaps);
  doc.setFillColor(30, 58, 138);
  doc.roundedRect(margin, yPosition, pageWidth - margin * 2, 35, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('综合评估分数', margin + 10, yPosition + 15);
  doc.setFontSize(28);
  doc.text(`${overallScore} 分`, pageWidth - margin - 30, yPosition + 22, { align: 'right' });
  doc.setTextColor(0, 0, 0);
  yPosition += 50;

  if (data.targetProgram) {
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('目标专业', margin, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`院校：${data.targetProgram.school}`, margin, yPosition);
    yPosition += 7;
    doc.text(`专业：${data.targetProgram.major} (${data.targetProgram.degree})`, margin, yPosition);
    yPosition += 7;
    if (data.targetProgram.deadline) {
      doc.text(`截止日期：${data.targetProgram.deadline}`, margin, yPosition);
      yPosition += 7;
    }
    yPosition += 10;
  }

  if (yPosition > pageHeight - 50) {
    doc.addPage();
    yPosition = margin;
  }

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('项目概览', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const sortedProjects = [...data.projects].sort((a, b) => a.order - b.order);
  sortedProjects.forEach((project, index) => {
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFillColor(249, 115, 22);
    doc.roundedRect(margin, yPosition, 5, 5, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. ${project.title}`, margin + 12, yPosition + 4);
    yPosition += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`角色：${project.role || '未填写'}`, margin + 12, yPosition);
    yPosition += 5;
    doc.text(`时间：${project.startDate || '未填写'} - ${project.endDate || '未填写'}`, margin + 12, yPosition);
    yPosition += 5;

    if (project.outputs.length > 0) {
      doc.text(`产出：${project.outputs.join('、')}`, margin + 12, yPosition);
      yPosition += 5;
    }

    if (project.processNodes.length > 0) {
      doc.text(`过程节点：${project.processNodes.length}个`, margin + 12, yPosition);
      yPosition += 5;
    }

    yPosition += 5;
  });

  yPosition += 5;

  if (abilityGaps.length > 0) {
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('能力分析', margin, yPosition);
    yPosition += 12;

    abilityGaps.forEach((gap) => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = margin;
      }

      const barWidth = 120;
      const barX = margin + 35;
      const gapColor = gap.gap > 20 ? [220, 38, 38] : gap.gap > 10 ? [245, 158, 11] : [34, 197, 94];

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(gap.dimension, margin, yPosition + 4);

      doc.setFillColor(230, 230, 230);
      doc.roundedRect(barX, yPosition, barWidth, 6, 2, 2, 'F');

      const requiredWidth = (gap.requiredLevel / 100) * barWidth;
      doc.setFillColor(200, 200, 200);
      doc.roundedRect(barX, yPosition, requiredWidth, 6, 2, 2, 'F');

      const currentWidth = (gap.currentLevel / 100) * barWidth;
      doc.setFillColor(gapColor[0], gapColor[1], gapColor[2]);
      doc.roundedRect(barX, yPosition, Math.min(currentWidth, barWidth), 6, 2, 2, 'F');

      doc.setFontSize(9);
      doc.text(`${gap.currentLevel}/${gap.requiredLevel}`, barX + barWidth + 5, yPosition + 5);

      yPosition += 12;
    });

    yPosition += 5;
  }

  const criticalGaps = abilityGaps.filter((g) => g.gap > 15);
  if (criticalGaps.length > 0) {
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('改进建议', margin, yPosition);
    yPosition += 12;

    criticalGaps.forEach((gap) => {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = margin;
      }

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`● ${gap.dimension}（缺口 ${gap.gap} 分）`, margin, yPosition);
      yPosition += 7;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      gap.suggestions.slice(0, 2).forEach((suggestion) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(`  - ${suggestion}`, margin + 5, yPosition);
        yPosition += 6;
      });
      yPosition += 4;
    });
  }

  if (yPosition > pageHeight - 50) {
    doc.addPage();
    yPosition = margin;
  }

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('材料清单完成度', margin, yPosition);
  yPosition += 10;

  const completed = data.materialChecklist.filter((m) => m.completed).length;
  const total = data.materialChecklist.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`已完成：${completed}/${total} (${percentage}%)`, margin, yPosition);
  yPosition += 8;

  const progressWidth = pageWidth - margin * 2;
  doc.setFillColor(230, 230, 230);
  doc.roundedRect(margin, yPosition, progressWidth, 8, 3, 3, 'F');
  doc.setFillColor(30, 58, 138);
  doc.roundedRect(margin, yPosition, (percentage / 100) * progressWidth, 8, 3, 3, 'F');
  yPosition += 20;

  const categories = [...new Set(data.materialChecklist.map((m) => m.category))];
  categories.forEach((category) => {
    if (yPosition > pageHeight - 30) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(category, margin, yPosition);
    yPosition += 8;

    const categoryItems = data.materialChecklist.filter((m) => m.category === category);
    categoryItems.forEach((item) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = margin;
      }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const checkMark = item.completed ? '✓' : '○';
      const priorityMark = item.priority === 'high' ? '★' : item.priority === 'medium' ? '☆' : '';
      const requiredMark = item.required ? '[必]' : '[选]';
      doc.text(`${checkMark} ${requiredMark}${priorityMark} ${item.item}`, margin + 5, yPosition);
      yPosition += 6;
    });
    yPosition += 4;
  });

  doc.addPage();
  yPosition = margin;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('作品集评估总结', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');

  let summary = '';
  if (overallScore >= 80) {
    summary = '您的作品集整体质量优秀，已基本达到目标院校的申请要求。建议重点优化以下方面：';
  } else if (overallScore >= 60) {
    summary = '您的作品集已有较好的基础，但仍有提升空间。建议在以下方面重点加强：';
  } else {
    summary = '您的作品集还需要较多的准备工作。建议按照以下优先级进行提升：';
  }

  const lines = doc.splitTextToSize(summary, pageWidth - margin * 2);
  doc.text(lines, margin, yPosition);
  yPosition += lines.length * 7 + 10;

  const highPriorityGaps = abilityGaps.filter((g) => g.gap > 15);
  if (highPriorityGaps.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('高优先级改进项：', margin, yPosition);
    yPosition += 8;
    doc.setFont('helvetica', 'normal');
    highPriorityGaps.slice(0, 3).forEach((gap, i) => {
      doc.text(`${i + 1}. ${gap.dimension} - 缺口 ${gap.gap} 分`, margin + 5, yPosition);
      yPosition += 7;
    });
    yPosition += 5;
  }

  const incompleteItems = data.materialChecklist.filter((m) => m.required && !m.completed);
  if (incompleteItems.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('待补充材料：', margin, yPosition);
    yPosition += 8;
    doc.setFont('helvetica', 'normal');
    incompleteItems.slice(0, 5).forEach((item, i) => {
      doc.text(`${i + 1}. ${item.item}`, margin + 5, yPosition);
      yPosition += 7;
    });
  }

  yPosition = pageHeight - margin;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(128, 128, 128);
  doc.text('本报告由作品集诊断工具自动生成，仅供参考', pageWidth / 2, yPosition, { align: 'center' });

  const fileName = `作品集诊断报告_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

async function exportElementToPDF(element: HTMLElement): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const imgWidth = 210;
  const pageHeight = 297;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const doc = new jsPDF('p', 'mm', 'a4');
  let heightLeft = imgHeight;
  let position = 0;

  doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    doc.addPage();
    doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  const fileName = `作品集导出_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
