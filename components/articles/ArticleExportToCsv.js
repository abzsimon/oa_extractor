export function exportToCsv(articleInfo) {
    if (!articleInfo || !articleInfo.title) {
      alert("Aucune donnée à exporter.");
      return;
    }
  
    const row = {
      Title: articleInfo.title || "",
      Authors: articleInfo.authors || "",
      PublicationName: articleInfo.publishedIn || "",
      AlternateName: articleInfo.doi || "None",
      Abstract: articleInfo.abstract || "",
      Url: articleInfo.url || "",
      AuthorAddress: articleInfo.authorAddress || "None",
      Year: articleInfo.pubyear || "",
      Doi: articleInfo.doi || "",
      ReferenceType: articleInfo.referenceType || "",
      Keywords: (articleInfo.topics || []).join("; "),
      PdfRelativePath: articleInfo.pdfRelativePath || "",
      CustomId: articleInfo.customId || articleInfo.id || "",
    };
  
    const headers = Object.keys(row).join(",");
    const values = Object.values(row)
      .map((val) => `"${String(val).replace(/"/g, '""')}"`)
      .join(",");
  
    const csvContent = `${headers}\n${values}`;
  
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
  
    link.setAttribute("href", url);
    link.setAttribute("download", `${row.CustomId || "export"}-syrf.csv`);
    link.click();
  }
  