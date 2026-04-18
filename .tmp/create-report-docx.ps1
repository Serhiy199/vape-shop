$ErrorActionPreference = "Stop"

$root = "D:\Copy_WSL_Project\vape-shop"
$sourcePath = Join-Path $root ".tmp\report-2026-04-18-admin-foundation.md"
$staging = Join-Path $root ".tmp\docx-report-2026-04-18"
$zipPath = Join-Path $root ".tmp\docx-report-2026-04-18.zip"
$outPath = Join-Path $root "Vape_Shop_Report_2026-04-18_Admin_Foundation.docx"

if (Test-Path $staging) {
  Remove-Item -LiteralPath $staging -Recurse -Force
}

if (Test-Path $outPath) {
  Remove-Item -LiteralPath $outPath -Force
}
if (Test-Path $zipPath) {
  Remove-Item -LiteralPath $zipPath -Force
}

New-Item -ItemType Directory -Path $staging | Out-Null
New-Item -ItemType Directory -Path (Join-Path $staging "_rels") | Out-Null
New-Item -ItemType Directory -Path (Join-Path $staging "docProps") | Out-Null
New-Item -ItemType Directory -Path (Join-Path $staging "word") | Out-Null

$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$mdLines = [System.IO.File]::ReadAllLines($sourcePath, [System.Text.Encoding]::UTF8)

function Escape-Xml([string]$text) {
  return [System.Security.SecurityElement]::Escape($text)
}

$contentTypes = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>
'@

$rels = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>
'@

$title = ($mdLines | Where-Object { $_.Trim() -ne "" } | Select-Object -First 1)
if ($title.StartsWith("# ")) {
  $title = $title.Substring(2)
}

$corePrefix = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
$coreBody = '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
$coreBody += '<dc:title>' + (Escape-Xml $title) + '</dc:title>'
$coreBody += '<dc:creator>OpenAI Codex</dc:creator>'
$coreBody += '<cp:lastModifiedBy>OpenAI Codex</cp:lastModifiedBy>'
$coreBody += '<dcterms:created xsi:type="dcterms:W3CDTF">2026-04-18T18:00:00Z</dcterms:created>'
$coreBody += '<dcterms:modified xsi:type="dcterms:W3CDTF">2026-04-18T18:00:00Z</dcterms:modified>'
$coreBody += '</cp:coreProperties>'
$core = $corePrefix + $coreBody

$app = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Microsoft Office Word</Application>
</Properties>
'@

$paragraphs = foreach ($line in $mdLines) {
  $trimmed = $line.TrimEnd()

  if ($trimmed -eq "") {
    '<w:p/>'
    continue
  }

  $text = $trimmed
  if ($text.StartsWith("# ")) { $text = $text.Substring(2) }
  elseif ($text.StartsWith("## ")) { $text = $text.Substring(3) }
  elseif ($text.StartsWith("### ")) { $text = $text.Substring(4) }
  elseif ($text.StartsWith("- ")) { $text = "• " + $text.Substring(2) }

  '<w:p><w:r><w:t xml:space="preserve">' + (Escape-Xml $text) + '</w:t></w:r></w:p>'
}

$documentPrefix = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
$documentBodyStart = '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>'
$documentBodyEnd = '<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1800" w:bottom="1440" w:left="1800" w:header="720" w:footer="720" w:gutter="0"/></w:sectPr></w:body></w:document>'
$document = $documentPrefix + $documentBodyStart + ($paragraphs -join "") + $documentBodyEnd

[System.IO.File]::WriteAllText((Join-Path $staging "[Content_Types].xml"), $contentTypes, $utf8NoBom)
[System.IO.File]::WriteAllText((Join-Path $staging "_rels\.rels"), $rels, $utf8NoBom)
[System.IO.File]::WriteAllText((Join-Path $staging "docProps\core.xml"), $core, $utf8NoBom)
[System.IO.File]::WriteAllText((Join-Path $staging "docProps\app.xml"), $app, $utf8NoBom)
[System.IO.File]::WriteAllText((Join-Path $staging "word\document.xml"), $document, $utf8NoBom)

Compress-Archive -Path (Join-Path $staging "*") -DestinationPath $zipPath
Move-Item -LiteralPath $zipPath -Destination $outPath
Write-Output $outPath
