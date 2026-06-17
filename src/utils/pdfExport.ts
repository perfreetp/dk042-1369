import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import type { PortfolioData, AbilityGap } from '../types';
import { calculateOverallScore } from './diagnosis';

async function renderReportToDOM(
  data: PortfolioData,
  abilityGaps: AbilityGap[]
): Promise<HTMLElement> {
  const overallScore = calculateOverallScore(abilityGaps);
  const sortedProjects = [...data.projects].sort((a, b) => a.order - b.order);
  const completed = data.materialChecklist.filter((m) => m.completed).length;
  const total = data.materialChecklist.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const criticalGaps = abilityGaps.filter((g) => g.gap > 15);
  const incompleteItems = data.materialChecklist.filter((m) => m.required && !m.completed);

  const scoreColor =
    overallScore >= 80
      ? '#16a34a'
      : overallScore >= 60
      ? '#ca8a04'
      : '#dc2626';

  let targetProgramHTML = '';
  if (data.targetProgram) {
    targetProgramHTML = `
      <div style="margin-bottom: 32px;">
        <h2 style="font-size: 22px; font-weight: 700; color: #18181b; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #e4e4e7;">🎯 目标专业</h2>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
          <p style="font-size: 16px; color: #334155; margin: 0 0 8px 0;"><strong>院校：</strong>${data.targetProgram.school}</p>
          <p style="font-size: 16px; color: #334155; margin: 0 0 8px 0;"><strong>专业：</strong>${data.targetProgram.major} (${data.targetProgram.degree})</p>
          ${data.targetProgram.deadline ? `<p style="font-size: 16px; color: #334155; margin: 0;"><strong>截止日期：</strong>${new Date(data.targetProgram.deadline).toLocaleDateString('zh-CN')}</p>` : ''}
        </div>
      </div>
    `;
  }

  let projectsHTML = '';
  sortedProjects.forEach((project, index) => {
    projectsHTML += `
      <div style="margin-bottom: 24px; padding: 20px; background: #fafafa; border: 1px solid #f0f0f0; border-radius: 8px; border-left: 4px solid #f97316;">
        <h4 style="font-size: 17px; font-weight: 600; color: #27272a; margin: 0 0 10px 0;">
          <span style="color: #f97316;">${index + 1}.</span> ${project.title || '未命名项目'}
        </h4>
        <p style="font-size: 14px; color: #52525b; margin: 4px 0;"><strong>角色：</strong>${project.role || '未填写'}</p>
        <p style="font-size: 14px; color: #52525b; margin: 4px 0;"><strong>时间：</strong>${project.startDate || '未填写'} - ${project.endDate || '未填写'}</p>
        ${project.outputs.length > 0 ? `<p style="font-size: 14px; color: #52525b; margin: 4px 0;"><strong>产出：</strong>${project.outputs.join('、')}</p>` : ''}
        ${project.processNodes.length > 0 ? `<p style="font-size: 14px; color: #52525b; margin: 4px 0;"><strong>过程节点：</strong>${project.processNodes.length} 个</p>` : ''}
        ${project.description ? `<p style="font-size: 14px; color: #52525b; margin: 10px 0 0 0; line-height: 1.7;"><strong>描述：</strong>${project.description}</p>` : ''}
      </div>
    `;
  });

  let abilityHTML = '';
  abilityGaps.forEach((gap) => {
    const gapColor =
      gap.gap > 20 ? '#dc2626' : gap.gap > 10 ? '#f59e0b' : '#16a34a';
    const barWidth = 500;
    const currentWidth = (gap.currentLevel / 100) * barWidth;
    const requiredWidth = (gap.requiredLevel / 100) * barWidth;

    abilityHTML += `
      <div style="margin-bottom: 20px;">
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 15px; font-weight: 600; color: #27272a; width: 120px; flex-shrink: 0;">${gap.dimension}</span>
          <div style="flex: 1; position: relative; height: 14px;">
            <div style="position: absolute; top: 0; left: 0; width: ${requiredWidth}px; height: 14px; background: #d4d4d8; border-radius: 7px;"></div>
            <div style="position: absolute; top: 0; left: 0; width: ${currentWidth}px; height: 14px; background: ${gapColor}; border-radius: 7px;"></div>
          </div>
          <span style="font-size: 13px; color: #71717a; margin-left: 12px; width: 80px; text-align: right; flex-shrink: 0;">${gap.currentLevel}/${gap.requiredLevel}</span>
        </div>
        ${gap.gap > 0 && gap.suggestions.length > 0 ? `
          <div style="margin-left: 120px; padding: 10px 14px; background: #fffbeb; border: 1px solid #fef3c7; border-radius: 6px;">
            <p style="font-size: 13px; color: #92400e; margin: 0; line-height: 1.6;">💡 ${gap.suggestions[0]}</p>
          </div>
        ` : ''}
      </div>
    `;
  });

  let suggestionsHTML = '';
  if (criticalGaps.length > 0) {
    criticalGaps.forEach((gap) => {
      suggestionsHTML += `
        <div style="margin-bottom: 18px; padding: 16px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px;">
          <h4 style="font-size: 16px; font-weight: 600; color: #991b1b; margin: 0 0 8px 0;">⚠️ ${gap.dimension}（缺口 ${gap.gap} 分）</h4>
          <ul style="margin: 0; padding-left: 20px;">
            ${gap.suggestions.slice(0, 2).map((s) => `<li style="font-size: 14px; color: #7f1d1d; line-height: 1.8; margin-bottom: 4px;">${s}</li>`).join('')}
          </ul>
        </div>
      `;
    });
  }

  const categories = [...new Set(data.materialChecklist.map((m) => m.category))];
  let materialHTML = '';
  categories.forEach((category) => {
    const categoryItems = data.materialChecklist.filter((m) => m.category === category);
    let itemsHTML = '';
    categoryItems.forEach((item) => {
      const checkMark = item.completed ? '✅' : '⬜';
      const priorityMark =
        item.priority === 'high' ? '★' : item.priority === 'medium' ? '☆' : '';
      const requiredMark = item.required ? '[必]' : '[选]';
      itemsHTML += `<p style="font-size: 14px; color: #3f3f46; margin: 4px 0; line-height: 1.6;">${checkMark} ${requiredMark}${priorityMark} ${item.item}</p>`;
    });

    materialHTML += `
      <div style="margin-bottom: 20px;">
        <h4 style="font-size: 16px; font-weight: 600; color: #27272a; margin: 0 0 10px 0; padding-bottom: 6px; border-bottom: 1px solid #e4e4e7;">${category}</h4>
        <div style="padding-left: 8px;">${itemsHTML}</div>
      </div>
    `;
  });

  let summaryActionHTML = '';
  if (criticalGaps.length > 0) {
    summaryActionHTML += `
      <div style="margin-bottom: 24px;">
        <h4 style="font-size: 16px; font-weight: 600; color: #27272a; margin: 0 0 12px 0;">🎯 高优先级改进项：</h4>
        <ol style="margin: 0; padding-left: 28px;">
          ${criticalGaps
            .slice(0, 3)
            .map((g, i) => `<li style="font-size: 15px; color: #3f3f46; line-height: 1.8; margin-bottom: 6px;">${g.dimension} - 缺口 ${g.gap} 分</li>`)
            .join('')}
        </ol>
      </div>
    `;
  }
  if (incompleteItems.length > 0) {
    summaryActionHTML += `
      <div style="margin-bottom: 24px;">
        <h4 style="font-size: 16px; font-weight: 600; color: #27272a; margin: 0 0 12px 0;">📋 待补充材料：</h4>
        <ol style="margin: 0; padding-left: 28px;">
          ${incompleteItems
            .slice(0, 5)
            .map((it, i) => `<li style="font-size: 15px; color: #3f3f46; line-height: 1.8; margin-bottom: 6px;">${it.item}</li>`)
            .join('')}
        </ol>
      </div>
    `;
  }

  const summaryText =
    overallScore >= 80
      ? '您的作品集整体质量优秀，已基本达到目标院校的申请要求。建议继续完善细节，打磨作品呈现效果。'
      : overallScore >= 60
      ? '您的作品集已有较好的基础，但仍有提升空间。建议按照下方建议重点加强相关能力维度。'
      : '您的作品集还需要较多的准备工作。建议按照优先级系统性地提升能力、补充项目经历。';

  const html = `
    <div id="pdf-report-container" style="width: 794px; background: white; padding: 60px 70px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif; color: #18181b; line-height: 1.6;">
      <div style="text-align: center; padding-bottom: 32px; border-bottom: 3px solid #1e3a8a; margin-bottom: 40px;">
        <h1 style="font-size: 32px; font-weight: 800; color: #1e3a8a; margin: 0 0 16px 0;">作品集诊断报告</h1>
        <p style="font-size: 15px; color: #71717a; margin: 0;">生成日期：${new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</p>
      </div>

      <div style="background: linear-gradient(135deg, #1e3a8a 0%, #312e81 100%); border-radius: 12px; padding: 28px 32px; margin-bottom: 40px; color: white;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <p style="font-size: 15px; color: #bfdbfe; margin: 0 0 8px 0;">综合评估分数</p>
            <div style="display: flex; align-items: baseline; gap: 8px;">
              <span style="font-size: 56px; font-weight: 800; color: ${overallScore >= 80 ? '#86efac' : overallScore >= 60 ? '#fde68a' : '#fca5a5'};">${overallScore}</span>
              <span style="font-size: 18px; color: #e0e7ff;">/ 100</span>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="width: 80px; height: 80px; border-radius: 50%; background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; font-size: 36px;">
              ${overallScore >= 80 ? '🎉' : overallScore >= 60 ? '💪' : '🚀'}
            </div>
          </div>
        </div>
      </div>

      ${targetProgramHTML}

      <div style="margin-bottom: 32px;">
        <h2 style="font-size: 22px; font-weight: 700; color: #18181b; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #e4e4e7;">📁 项目概览 (${sortedProjects.length})</h2>
        ${sortedProjects.length > 0 ? projectsHTML : '<p style="color: #a1a1aa; font-style: italic;">暂无项目</p>'}
      </div>

      <div style="margin-bottom: 32px;">
        <h2 style="font-size: 22px; font-weight: 700; color: #18181b; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #e4e4e7;">📊 能力分析</h2>
        ${abilityGaps.length > 0 ? abilityHTML : '<p style="color: #a1a1aa; font-style: italic;">请先选择目标专业进行能力诊断</p>'}
      </div>

      ${criticalGaps.length > 0 ? `
        <div style="margin-bottom: 32px;">
          <h2 style="font-size: 22px; font-weight: 700; color: #18181b; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #e4e4e7;">💡 改进建议</h2>
          ${suggestionsHTML}
        </div>
      ` : ''}

      <div style="margin-bottom: 32px;">
        <h2 style="font-size: 22px; font-weight: 700; color: #18181b; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #e4e4e7;">✅ 材料清单 (${completed}/${total} - ${percentage}%)</h2>
        <div style="margin-bottom: 20px;">
          <div style="width: 100%; height: 12px; background: #e4e4e7; border-radius: 6px; overflow: hidden;">
            <div style="width: ${percentage}%; height: 100%; background: linear-gradient(90deg, #1e3a8a 0%, #4f46e5 100%); transition: width 0.5s;"></div>
          </div>
        </div>
        ${materialHTML}
      </div>

      <div style="margin-bottom: 32px; padding: 28px; background: linear-gradient(135deg, #fefce8 0%, #fef9c3 100%); border-radius: 12px; border: 1px solid #fde68a;">
        <h2 style="font-size: 22px; font-weight: 700; color: #713f12; margin: 0 0 16px 0; text-align: center;">📝 评估总结</h2>
        <p style="font-size: 16px; color: #78350f; margin: 0 0 20px 0; line-height: 1.8; text-align: center;">${summaryText}</p>
        ${summaryActionHTML}
      </div>

      <div style="text-align: center; padding-top: 28px; border-top: 1px solid #e4e4e7; color: #a1a1aa; font-size: 13px;">
        本报告由作品集诊断工具自动生成，仅供参考
      </div>
    </div>
  `;

  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.left = '-9999px';
  wrapper.style.top = '0';
  wrapper.style.zIndex = '-9999';
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);

  await new Promise((resolve) => setTimeout(resolve, 100));

  return wrapper.firstElementChild as HTMLElement;
}

export async function exportToPDF(
  data: PortfolioData,
  abilityGaps: AbilityGap[],
  elementId?: string
): Promise<void> {
  if (elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      await exportElementToPDF(element);
      return;
    }
  }

  const reportElement = await renderReportToDOM(data, abilityGaps);

  try {
    const canvas = await html2canvas(reportElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 900,
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

    const fileName = `作品集诊断报告_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  } finally {
    if (reportElement && reportElement.parentNode) {
      reportElement.parentNode.removeChild(reportElement);
    }
  }
}

async function exportElementToPDF(element: HTMLElement): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
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
