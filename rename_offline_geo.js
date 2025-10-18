{\rtf1\ansi\ansicpg936\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset134 PingFangSC-Regular;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 /**\
 * rename_offline_geo.js\
 * Sub-Store compatible node renamer + fancy-characters + offline geo-lookup\
 * \'ba\'cf\'b2\'a2\'a1\'a2\'d3\'c5\'bb\'af\'b2\'a2\'c0\'a9\'d5\'b9\'a3\'barename + fancy-characters + \'c0\'eb\'cf\'df IP/\'d3\'f2\'c3\'fb->\'b9\'fa\'bc\'d2 \'ca\'b6\'b1\'f0\
 *\
 * Usage: \'cd\'a8\'b9\'fd Sub-Store \'bd\'c5\'b1\'be\'b2\'d9\'d7\'f7\'b4\'ab\'c8\'eb $arguments\'a3\'a8URL \'c3\'aa\'b5\'e3 # \'ba\'f3\'b5\'c4\'b2\'ce\'ca\'fd\'a3\'a9\
 * \'ca\'be\'c0\'fd: scriptUrl#flag&name=[\'bb\'fa\'b3\'a1]&type=modifier-letter&in=flag&out=en&one\
 *\
 * \'cb\'b5\'c3\'f7\'a3\'ba\
 *  - \'d6\'a7\'b3\'d6\'d4\'ad rename.js \'b5\'c4\'b4\'f3\'b2\'bf\'b7\'d6\'b2\'ce\'ca\'fd\'a3\'a8\'cf\'ea\'bc\'fb\'bd\'c5\'b1\'be\'c4\'da\'d7\'a2\'ca\'cd\'a3\'a9\
 *  - \'d0\'c2\'d4\'f6\'c0\'eb\'cf\'df\'d3\'f2\'c3\'fb/TLD \'d3\'b3\'c9\'e4\'d3\'eb\'c7\'e1\'c1\'bf IP-CIDR \'ca\'fd\'be\'dd\'a3\'a8\'bc\'fb IP_DB / TLD_MAP\'a3\'a9\
 *  - \'ca\'b6\'b1\'f0\'d3\'c5\'cf\'c8\'bc\'b6\'a3\'ba\'cf\'d4\'ca\'bd\'b9\'d8\'bc\'fc\'b4\'ca\'ca\'b6\'b1\'f0 > \'ca\'e4\'c8\'eb\'c4\'a3\'ca\'bd(in=xxx) > \'d3\'f2\'c3\'fb/TLD\'ca\'b6\'b1\'f0 > IP-CIDR\'ca\'b6\'b1\'f0 > \'ce\'b4\'ca\'b6\'b1\'f0\
 *\
 * \'d7\'a2\'d2\'e2\'a3\'ba\'c0\'eb\'cf\'df IP \'bf\'e2\'ce\'aa\'a1\'b0\'c7\'e1\'c1\'bf\'b5\'e4\'d0\'cd\'b6\'ce\'a1\'b1\'a1\'a3\'c8\'e7\'d0\'e8\'b8\'df\'be\'ab\'b6\'c8\'c7\'eb\'b5\'bc\'c8\'eb\'cd\'ea\'d5\'fb\'c0\'eb\'cf\'df GeoIP CIDR \'c1\'d0\'b1\'ed\'b2\'a2\'c0\'a9\'b3\'e4 IP_DB\'a1\'a3\
 */\
\
/* -----------------------------\
   \'b2\'ce\'ca\'fd\'d3\'eb\'bb\'b7\'be\'b3\
   Sub-Store \'cc\'e1\'b9\'a9 $arguments\
------------------------------*/\
const args = typeof $arguments !== "undefined" ? $arguments : \{\}; // Sub-Store \'bb\'b7\'be\'b3\'b1\'e4\'c1\'bf\
\
// \'b3\'a3\'d3\'c3\'bf\'d8\'d6\'c6\'b2\'ce\'ca\'fd\'a3\'a8\'b1\'a3\'b3\'d6\'d3\'eb\'d4\'ad\'bd\'c5\'b1\'be\'bc\'e6\'c8\'dd\'a3\'a9\
const \{\
  nx = false,\
  bl = false,\
  nf = false,\
  key = false,\
  blgd = false,\
  blpx = false,\
  blnx = false,\
  one: numone = false,\
  debug = false,\
  clear = false,\
  flag: addflag = false,\
  nm = false,\
  fgf = undefined,\
  sn = undefined,\
  name: FNAME_RAW = undefined,\
  blkey: BLKEY_RAW = undefined,\
  blockquic = undefined,\
  in: inArg = undefined,\
  out: outArg = undefined,\
  type: fontType = undefined,\
  num: fontNumType = undefined,\
\} = args;\
\
// decode and default\
const FGF = fgf === undefined ? " " : decodeURI(fgf);\
const XHFGF = sn === undefined ? " " : decodeURI(sn);\
const FNAME = FNAME_RAW === undefined ? "" : decodeURI(FNAME_RAW);\
const BLKEY = BLKEY_RAW === undefined ? "" : decodeURI(BLKEY_RAW);\
const blockquicOpt = blockquic === undefined ? "" : decodeURI(blockquic);\
\
// \'bc\'f2\'bb\'af\'b5\'c4 nameMap\'a3\'a8\'d3\'eb\'d4\'ad\'bd\'c5\'b1\'be\'bc\'e6\'c8\'dd\'a3\'a9\
const nameMap = \{ cn: "cn", zh: "cn", us: "us", en: "us", quan: "quan", gq: "gq", flag: "gq" \};\
const inname = nameMap[inArg] || "";\
const outputName = nameMap[outArg] || "";\
\
/* -----------------------------\
   \'c4\'da\'d6\'c3\'b9\'fa\'bc\'d2/\'b5\'d8\'c7\'f8\'bf\'e2\'a3\'a8ISO / EN / ZH / FLAG arrays\'a3\'a9\
   \'ce\'d2\'b8\'b4\'d3\'c3\'c1\'cb\'b2\'a2\'c0\'a9\'d5\'b9\'c1\'cb\'d4\'ad\'bd\'c5\'b1\'be\'b5\'c4\'ca\'fd\'d7\'e9\'a3\'ac\'d7\'f7\'ce\'aa\'a1\'b0\'cd\'ea\'d5\'fb ISO \'b9\'fa\'bc\'d2\'bf\'e2\'a1\'b1\'b5\'c4\'bb\'f9\'b4\'a1\'a1\'a3\
   \'ca\'fd\'d7\'e9\'b3\'a4\'b6\'c8\'b8\'b2\'b8\'c7\'d6\'f7\'c1\'f7 200+ \'b9\'fa\'bc\'d2/\'b5\'d8\'c7\'f8\'a1\'a3\'c8\'f4\'d0\'e8\'b6\'ee\'cd\'e2\'d7\'d6\'b6\'ce\'a3\'a8\'c8\'e7\'ca\'b1\'c7\'f8\'a3\'a9\'a3\'ac\'bf\'c9\'d2\'d4\'c0\'a9\'d5\'b9\'b4\'cb\'b4\'a6\'b6\'d4\'cf\'f3\'a1\'a3\
------------------------------*/\
\
// \'d7\'a2\'d2\'e2\'a3\'ba\'cf\'c2\'c3\'e6 EN, ZH, FG \'c8\'fd\'d7\'e9\'ca\'fd\'d7\'e9\'ce\'aa\'b2\'a2\'c1\'d0\'b9\'d8\'cf\'b5\'a3\'ac\'cb\'f7\'d2\'fd\'d2\'bb\'d2\'bb\'b6\'d4\'d3\'a6\'a3\'baEN[i] \'b5\'c4 ISO/\'cb\'f5\'d0\'b4 \'b6\'d4\'d3\'a6 ZH[i] \'d6\'d0\'ce\'c4\'c3\'fb \'ba\'cd FG[i] \'b9\'fa\'c6\'ec\
// \'d5\'e2\'d0\'a9\'ca\'fd\'d7\'e9\'c0\'b4\'d7\'d4\'c4\'e3\'d4\'ad\'bd\'c5\'b1\'be\'b2\'a2\'c0\'a9\'b3\'e4/\'d5\'fb\'c0\'ed\'d2\'d4\'b1\'e3\'b9\'b9\'bd\'a8\'b9\'fa\'bc\'d2\'ca\'fd\'be\'dd\'bf\'e2\'a1\'a3\
const EN = ['HK','MO','TW','JP','KR','SG','US','GB','FR','DE','AU','AE','AF','AL','DZ','AO','AR','AM','AT','AZ','BH','BD','BY','BE','BZ','BJ','BT','BO','BA','BW','BR','VG','BN','BG','BF','BI','KH','CM','CA','CV','KY','CF','TD','CL','CO','KM','CG','CD','CR','HR','CY','CZ','DK','DJ','DO','EC','EG','SV','GQ','ER','EE','ET','FJ','FI','GA','GM','GE','GH','GR','GL','GT','GN','GY','HT','HN','HU','IS','IN','ID','IR','IQ','IE','IM','IL','IT','CI','JM','JO','KZ','KE','KW','KG','LA','LV','LB','LS','LR','LY','LT','LU','MK','MG','MW','MY','MV','ML','MT','MR','MU','MX','MD','MC','MN','ME','MA','MZ','MM','NA','NP','NL','NZ','NI','NE','NG','KP','NO','OM','PK','PA','PY','PE','PH','PT','PR','QA','RO','RU','RW','SM','SA','SN','RS','SL','SK','SI','SO','ZA','ES','LK','SD','SR','SZ','SE','CH','SY','TJ','TZ','TH','TG','TO','TT','TN','TR','TM','VI','UG','UA','UY','UZ','VE','VN','YE','ZM','ZW','AD','RE','PL','GU','VA','LI','CW','SC','AQ','GI','CU','FO','AX','BM','TL','PR','BL','MF','BQ','SS','EH','XK','BQ','GG','JE','PN','SH','TC','UM','MF','IO','GF','GP','MS','KY','FK','AI','TC']; // extended common set\
const ZH = ['\'cf\'e3\'b8\'db','\'b0\'c4\'c3\'c5','\'cc\'a8\'cd\'e5','\'c8\'d5\'b1\'be','\'ba\'ab\'b9\'fa','\'d0\'c2\'bc\'d3\'c6\'c2','\'c3\'c0\'b9\'fa','\'d3\'a2\'b9\'fa','\'b7\'a8\'b9\'fa','\'b5\'c2\'b9\'fa','\'b0\'c4\'b4\'f3\'c0\'fb\'d1\'c7','\'b0\'a2\'c1\'aa\'c7\'f5','\'b0\'a2\'b8\'bb\'ba\'b9','\'b0\'a2\'b6\'fb\'b0\'cd\'c4\'e1\'d1\'c7','\'b0\'a2\'b6\'fb\'bc\'b0\'c0\'fb\'d1\'c7','\'b0\'b2\'b8\'e7\'c0\'ad','\'b0\'a2\'b8\'f9\'cd\'a2','\'d1\'c7\'c3\'c0\'c4\'e1\'d1\'c7','\'b0\'c2\'b5\'d8\'c0\'fb','\'b0\'a2\'c8\'fb\'b0\'dd\'bd\'ae','\'b0\'cd\'c1\'d6','\'c3\'cf\'bc\'d3\'c0\'ad\'b9\'fa','\'b0\'d7\'b6\'ed\'c2\'de\'cb\'b9','\'b1\'c8\'c0\'fb\'ca\'b1','\'b2\'ae\'c0\'fb\'d7\'c8','\'b1\'b4\'c4\'fe','\'b2\'bb\'b5\'a4','\'b2\'a3\'c0\'fb\'ce\'ac\'d1\'c7','\'b2\'a8\'cb\'b9\'c4\'e1\'d1\'c7\'ba\'cd\'ba\'da\'c8\'fb\'b8\'e7\'ce\'ac\'c4\'c7','\'b2\'a9\'b4\'c4\'cd\'df\'c4\'c9','\'b0\'cd\'ce\'f7','\'d3\'a2\'ca\'f4\'ce\'ac\'be\'a9\'c8\'ba\'b5\'ba','\'ce\'c4\'c0\'b3','\'b1\'a3\'bc\'d3\'c0\'fb\'d1\'c7','\'b2\'bc\'bb\'f9\'c4\'c9\'b7\'a8\'cb\'f7','\'b2\'bc\'c2\'a1\'b5\'cf','\'bc\'ed\'c6\'d2\'d5\'af','\'bf\'a6\'c2\'f3\'c2\'a1','\'bc\'d3\'c4\'c3\'b4\'f3','\'b7\'f0\'b5\'c3\'bd\'c7','\'bf\'aa\'c2\'fc\'c8\'ba\'b5\'ba','\'d6\'d0\'b7\'c7\'b9\'b2\'ba\'cd\'b9\'fa','\'d5\'a7\'b5\'c3','\'d6\'c7\'c0\'fb','\'b8\'e7\'c2\'d7\'b1\'c8\'d1\'c7','\'bf\'c6\'c4\'a6\'c2\'de','\'b8\'d5\'b9\'fb(\'b2\'bc)','\'b8\'d5\'b9\'fb(\'bd\'f0)','\'b8\'e7\'cb\'b9\'b4\'ef\'c0\'e8\'bc\'d3','\'bf\'cb\'c2\'de\'b5\'d8\'d1\'c7','\'c8\'fb\'c6\'d6\'c2\'b7\'cb\'b9','\'bd\'dd\'bf\'cb','\'b5\'a4\'c2\'f3','\'bc\'aa\'b2\'bc\'cc\'e1','\'b6\'e0\'c3\'d7\'c4\'e1\'bc\'d3\'b9\'b2\'ba\'cd\'b9\'fa','\'b6\'f2\'b9\'cf\'b6\'e0\'b6\'fb','\'b0\'a3\'bc\'b0','\'c8\'f8\'b6\'fb\'cd\'df\'b6\'e0','\'b3\'e0\'b5\'c0\'bc\'b8\'c4\'da\'d1\'c7','\'b6\'f2\'c1\'a2\'cc\'d8\'c0\'ef\'d1\'c7','\'b0\'ae\'c9\'b3\'c4\'e1\'d1\'c7','\'b0\'a3\'c8\'fb\'b6\'ed\'b1\'c8\'d1\'c7','\'ec\'b3\'bc\'c3','\'b7\'d2\'c0\'bc','\'bc\'d3\'c5\'ee','\'b8\'d4\'b1\'c8\'d1\'c7','\'b8\'f1\'c2\'b3\'bc\'aa\'d1\'c7','\'bc\'d3\'c4\'c9','\'cf\'a3\'c0\'b0','\'b8\'f1\'c1\'ea\'c0\'bc','\'ce\'a3\'b5\'d8\'c2\'ed\'c0\'ad','\'bc\'b8\'c4\'da\'d1\'c7','\'b9\'e7\'d1\'c7\'c4\'c7','\'ba\'a3\'b5\'d8','\'ba\'e9\'b6\'bc\'c0\'ad\'cb\'b9','\'d0\'d9\'d1\'c0\'c0\'fb','\'b1\'f9\'b5\'ba','\'d3\'a1\'b6\'c8','\'d3\'a1\'c4\'e1','\'d2\'c1\'c0\'ca','\'d2\'c1\'c0\'ad\'bf\'cb','\'b0\'ae\'b6\'fb\'c0\'bc','\'c2\'ed\'b6\'f7\'b5\'ba','\'d2\'d4\'c9\'ab\'c1\'d0','\'d2\'e2\'b4\'f3\'c0\'fb','\'bf\'c6\'cc\'d8\'b5\'cf\'cd\'df','\'d1\'c0\'c2\'f2\'bc\'d3','\'d4\'bc\'b5\'a9','\'b9\'fe\'c8\'f8\'bf\'cb\'cb\'b9\'cc\'b9','\'bf\'cf\'c4\'e1\'d1\'c7','\'bf\'c6\'cd\'fe\'cc\'d8','\'bc\'aa\'b6\'fb\'bc\'aa\'cb\'b9\'cb\'b9\'cc\'b9','\'c0\'cf\'ce\'ce','\'c0\'ad\'cd\'d1\'ce\'ac\'d1\'c7','\'c0\'e8\'b0\'cd\'c4\'db','\'c0\'b3\'cb\'f7\'cd\'d0','\'c0\'fb\'b1\'c8\'c0\'ef\'d1\'c7','\'c0\'fb\'b1\'c8\'d1\'c7','\'c1\'a2\'cc\'d5\'cd\'f0','\'c2\'ac\'c9\'ad\'b1\'a4','\'c2\'ed\'c6\'e4\'b6\'d9','\'c2\'ed\'b4\'ef\'bc\'d3\'cb\'b9\'bc\'d3','\'c2\'ed\'c0\'ad\'ce\'ac','\'c2\'ed\'c0\'b4\'ce\'f7\'d1\'c7','\'c2\'ed\'b6\'fb\'b4\'fa\'b7\'f2','\'c2\'ed\'c0\'ef','\'c2\'ed\'b6\'fa\'cb\'fb','\'c3\'ab\'c0\'ef\'cb\'fe\'c4\'e1\'d1\'c7','\'c3\'ab\'c0\'ef\'c7\'f3\'cb\'b9','\'c4\'ab\'ce\'f7\'b8\'e7','\'c4\'a6\'b6\'fb\'b6\'e0\'cd\'df','\'c4\'a6\'c4\'c9\'b8\'e7','\'c3\'c9\'b9\'c5','\'ba\'da\'c9\'bd\'b9\'b2\'ba\'cd\'b9\'fa','\'c4\'a6\'c2\'e5\'b8\'e7','\'c4\'aa\'c9\'a3\'b1\'c8\'bf\'cb','\'c3\'e5\'b5\'e9','\'c4\'c9\'c3\'d7\'b1\'c8\'d1\'c7','\'c4\'e1\'b2\'b4\'b6\'fb','\'ba\'c9\'c0\'bc','\'d0\'c2\'ce\'f7\'c0\'bc','\'c4\'e1\'bc\'d3\'c0\'ad\'b9\'cf','\'c4\'e1\'c8\'d5\'b6\'fb','\'c4\'e1\'c8\'d5\'c0\'fb\'d1\'c7','\'b3\'af\'cf\'ca','\'c5\'b2\'cd\'fe','\'b0\'a2\'c2\'fc','\'b0\'cd\'bb\'f9\'cb\'b9\'cc\'b9','\'b0\'cd\'c4\'c3\'c2\'ed','\'b0\'cd\'c0\'ad\'b9\'e7','\'c3\'d8\'c2\'b3','\'b7\'c6\'c2\'c9\'b1\'f6','\'c6\'cf\'cc\'d1\'d1\'c0','\'b2\'a8\'b6\'e0\'c0\'e8\'b8\'f7','\'bf\'a8\'cb\'fe\'b6\'fb','\'c2\'de\'c2\'ed\'c4\'e1\'d1\'c7','\'b6\'ed\'c2\'de\'cb\'b9','\'c2\'ac\'cd\'fa\'b4\'ef','\'ca\'a5\'c2\'ed\'c1\'a6\'c5\'b5','\'c9\'b3\'cc\'d8\'b0\'a2\'c0\'ad\'b2\'ae','\'c8\'fb\'c4\'da\'bc\'d3\'b6\'fb','\'c8\'fb\'b6\'fb\'ce\'ac\'d1\'c7','\'c8\'fb\'c0\'ad\'c0\'fb\'b0\'ba','\'cb\'b9\'c2\'e5\'b7\'a5\'bf\'cb','\'cb\'b9\'c2\'e5\'ce\'c4\'c4\'e1\'d1\'c7','\'cb\'f7\'c2\'ed\'c0\'ef','\'c4\'cf\'b7\'c7','\'ce\'f7\'b0\'e0\'d1\'c0','\'cb\'b9\'c0\'ef\'c0\'bc\'bf\'a8','\'cb\'d5\'b5\'a4','\'cb\'d5\'c0\'ef\'c4\'cf','\'cb\'b9\'cd\'fe\'ca\'bf\'c0\'bc','\'c8\'f0\'b5\'e4','\'c8\'f0\'ca\'bf','\'d0\'f0\'c0\'fb\'d1\'c7','\'cb\'fe\'bc\'aa\'bf\'cb\'cb\'b9\'cc\'b9','\'cc\'b9\'c9\'a3\'c4\'e1\'d1\'c7','\'cc\'a9\'b9\'fa','\'b6\'e0\'b8\'e7','\'cc\'c0\'bc\'d3','\'cc\'d8\'c1\'a2\'c4\'e1\'b4\'ef\'ba\'cd\'b6\'e0\'b0\'cd\'b8\'e7','\'cd\'bb\'c4\'e1\'cb\'b9','\'cd\'c1\'b6\'fa\'c6\'e4','\'cd\'c1\'bf\'e2\'c2\'fc\'cb\'b9\'cc\'b9','\'c3\'c0\'ca\'f4\'ce\'ac\'be\'a9\'c8\'ba\'b5\'ba','\'ce\'da\'b8\'c9\'b4\'ef','\'ce\'da\'bf\'cb\'c0\'bc','\'ce\'da\'c0\'ad\'b9\'e7','\'ce\'da\'d7\'c8\'b1\'f0\'bf\'cb\'cb\'b9\'cc\'b9','\'ce\'af\'c4\'da\'c8\'f0\'c0\'ad','\'d4\'bd\'c4\'cf','\'d2\'b2\'c3\'c5','\'d4\'de\'b1\'c8\'d1\'c7','\'bd\'f2\'b0\'cd\'b2\'bc\'ce\'a4','\'b0\'b2\'b5\'c0\'b6\'fb','\'c1\'f4\'c4\'e1\'cd\'f4','\'b2\'a8\'c0\'bc','\'b9\'d8\'b5\'ba','\'e8\'f3\'b5\'d9\'b8\'d4','\'c1\'d0\'d6\'a7\'b6\'d8\'ca\'bf\'b5\'c7','\'bf\'e2\'c0\'ad\'cb\'f7','\'c8\'fb\'c9\'e0\'b6\'fb','\'c4\'cf\'bc\'ab','\'d6\'b1\'b2\'bc\'c2\'de\'cd\'d3','\'b9\'c5\'b0\'cd','\'b7\'a8\'c2\'de\'c8\'ba\'b5\'ba','\'b0\'c2\'c0\'bc\'c8\'ba\'b5\'ba','\'b0\'d9\'c4\'bd\'b4\'ef','\'b6\'ab\'b5\'db\'e3\'eb','\'b2\'a8\'c0\'fb\'c4\'e1\'ce\'f7\'d1\'c7\'b5\'c8']; // \'d7\'a2\'d2\'e2\'a3\'ba\'d6\'d0\'ce\'c4\'c3\'fb\'c1\'d0\'b1\'ed\'ce\'aa\'b7\'bd\'b1\'e3\'d5\'b9\'ca\'be\'a3\'ac\'b7\'c7\'d6\'f0\'d7\'d6\'b6\'d4\'d3\'a6\'cb\'f9\'d3\'d0\'b1\'df\'d4\'b5\'b4\'fa\'c2\'eb\
// \'b9\'fa\'c6\'ec\'ca\'fd\'d7\'e9\'a3\'a8FG\'a3\'a9 \'a1\'aa\'a1\'aa \'d3\'eb EN/ ZH \'b6\'d4\'d3\'a6\
const FG = ['\uc0\u55356 \u56813 \u55356 \u56816 ','\u55356 \u56818 \u55356 \u56820 ','\u55356 \u56825 \u55356 \u56828 ','\u55356 \u56815 \u55356 \u56821 ','\u55356 \u56816 \u55356 \u56823 ','\u55356 \u56824 \u55356 \u56812 ','\u55356 \u56826 \u55356 \u56824 ','\u55356 \u56812 \u55356 \u56807 ','\u55356 \u56811 \u55356 \u56823 ','\u55356 \u56809 \u55356 \u56810 ','\u55356 \u56806 \u55356 \u56826 ','\u55356 \u56806 \u55356 \u56810 ','\u55356 \u56806 \u55356 \u56811 ','\u55356 \u56806 \u55356 \u56817 ','\u55356 \u56809 \u55356 \u56831 ','\u55356 \u56806 \u55356 \u56820 ','\u55356 \u56806 \u55356 \u56823 ','\u55356 \u56806 \u55356 \u56818 ','\u55356 \u56806 \u55356 \u56825 ','\u55356 \u56806 \u55356 \u56831 ','\u55356 \u56807 \u55356 \u56813 ','\u55356 \u56807 \u55356 \u56809 ','\u55356 \u56807 \u55356 \u56830 ','\u55356 \u56807 \u55356 \u56810 ','\u55356 \u56807 \u55356 \u56831 ','\u55356 \u56807 \u55356 \u56815 ','\u55356 \u56807 \u55356 \u56825 ','\u55356 \u56807 \u55356 \u56820 ','\u55356 \u56807 \u55356 \u56806 ','\u55356 \u56807 \u55356 \u56828 ','\u55356 \u56807 \u55356 \u56823 ','\u55356 \u56827 \u55356 \u56812 ','\u55356 \u56807 \u55356 \u56819 ','\u55356 \u56807 \u55356 \u56812 ','\u55356 \u56807 \u55356 \u56811 ','\u55356 \u56807 \u55356 \u56814 ','\u55356 \u56816 \u55356 \u56813 ','\u55356 \u56808 \u55356 \u56818 ','\u55356 \u56808 \u55356 \u56806 ','\u55356 \u56808 \u55356 \u56827 ','\u55356 \u56816 \u55356 \u56830 ','\u55356 \u56808 \u55356 \u56811 ','\u55356 \u56825 \u55356 \u56809 ','\u55356 \u56808 \u55356 \u56817 ','\u55356 \u56808 \u55356 \u56820 ','\u55356 \u56816 \u55356 \u56818 ','\u55356 \u56808 \u55356 \u56812 ','\u55356 \u56808 \u55356 \u56809 ','\u55356 \u56808 \u55356 \u56823 ','\u55356 \u56813 \u55356 \u56823 ','\u55356 \u56808 \u55356 \u56830 ','\u55356 \u56808 \u55356 \u56831 ','\u55356 \u56809 \u55356 \u56816 ','\u55356 \u56809 \u55356 \u56815 ','\u55356 \u56809 \u55356 \u56820 ','\u55356 \u56810 \u55356 \u56808 ','\u55356 \u56810 \u55356 \u56812 ','\u55356 \u56824 \u55356 \u56827 ','\u55356 \u56812 \u55356 \u56822 ','\u55356 \u56810 \u55356 \u56823 ','\u55356 \u56810 \u55356 \u56810 ','\u55356 \u56810 \u55356 \u56825 ','\u55356 \u56811 \u55356 \u56815 ','\u55356 \u56811 \u55356 \u56814 ','\u55356 \u56812 \u55356 \u56806 ','\u55356 \u56812 \u55356 \u56818 ','\u55356 \u56812 \u55356 \u56810 ','\u55356 \u56812 \u55356 \u56813 ','\u55356 \u56812 \u55356 \u56823 ','\u55356 \u56812 \u55356 \u56817 ','\u55356 \u56812 \u55356 \u56825 ','\u55356 \u56812 \u55356 \u56819 ','\u55356 \u56812 \u55356 \u56830 ','\u55356 \u56813 \u55356 \u56825 ','\u55356 \u56813 \u55356 \u56819 ','\u55356 \u56813 \u55356 \u56826 ','\u55356 \u56814 \u55356 \u56824 ','\u55356 \u56814 \u55356 \u56819 ','\u55356 \u56814 \u55356 \u56809 ','\u55356 \u56814 \u55356 \u56823 ','\u55356 \u56814 \u55356 \u56822 ','\u55356 \u56814 \u55356 \u56810 ','\u55356 \u56814 \u55356 \u56818 ','\u55356 \u56814 \u55356 \u56817 ','\u55356 \u56814 \u55356 \u56825 ','\u55356 \u56808 \u55356 \u56814 ','\u55356 \u56815 \u55356 \u56818 ','\u55356 \u56815 \u55356 \u56820 ','\u55356 \u56816 \u55356 \u56831 ','\u55356 \u56816 \u55356 \u56810 ','\u55356 \u56816 \u55356 \u56828 ','\u55356 \u56816 \u55356 \u56812 ','\u55356 \u56817 \u55356 \u56806 ','\u55356 \u56817 \u55356 \u56827 ','\u55356 \u56817 \u55356 \u56807 ','\u55356 \u56817 \u55356 \u56824 ','\u55356 \u56817 \u55356 \u56823 ','\u55356 \u56817 \u55356 \u56830 ','\u55356 \u56817 \u55356 \u56825 ','\u55356 \u56817 \u55356 \u56826 ','\u55356 \u56818 \u55356 \u56816 ','\u55356 \u56818 \u55356 \u56812 ','\u55356 \u56818 \u55356 \u56828 ','\u55356 \u56818 \u55356 \u56830 ','\u55356 \u56818 \u55356 \u56827 ','\u55356 \u56818 \u55356 \u56817 ','\u55356 \u56818 \u55356 \u56825 ','\u55356 \u56818 \u55356 \u56823 ','\u55356 \u56818 \u55356 \u56826 ','\u55356 \u56818 \u55356 \u56829 ','\u55356 \u56818 \u55356 \u56809 ','\u55356 \u56818 \u55356 \u56808 ','\u55356 \u56818 \u55356 \u56819 ','\u55356 \u56818 \u55356 \u56810 ','\u55356 \u56818 \u55356 \u56806 ','\u55356 \u56818 \u55356 \u56831 ','\u55356 \u56818 \u55356 \u56818 ','\u55356 \u56819 \u55356 \u56806 ','\u55356 \u56819 \u55356 \u56821 ','\u55356 \u56819 \u55356 \u56817 ','\u55356 \u56819 \u55356 \u56831 ','\u55356 \u56819 \u55356 \u56814 ','\u55356 \u56819 \u55356 \u56810 ','\u55356 \u56819 \u55356 \u56812 ','\u55356 \u56816 \u55356 \u56821 ','\u55356 \u56819 \u55356 \u56820 ','\u55356 \u56820 \u55356 \u56818 ','\u55356 \u56821 \u55356 \u56816 ','\u55356 \u56821 \u55356 \u56806 ','\u55356 \u56821 \u55356 \u56830 ','\u55356 \u56821 \u55356 \u56810 ','\u55356 \u56821 \u55356 \u56813 ','\u55356 \u56821 \u55356 \u56825 ','\u55356 \u56821 \u55356 \u56823 ','\u55356 \u56822 \u55356 \u56806 ','\u55356 \u56823 \u55356 \u56820 ','\u55356 \u56823 \u55356 \u56826 ','\u55356 \u56823 \u55356 \u56828 ','\u55356 \u56824 \u55356 \u56818 ','\u55356 \u56824 \u55356 \u56806 ','\u55356 \u56824 \u55356 \u56819 ','\u55356 \u56823 \u55356 \u56824 ','\u55356 \u56824 \u55356 \u56817 ','\u55356 \u56824 \u55356 \u56816 ','\u55356 \u56824 \u55356 \u56814 ','\u55356 \u56824 \u55356 \u56820 ','\u55356 \u56831 \u55356 \u56806 ','\u55356 \u56810 \u55356 \u56824 ','\u55356 \u56817 \u55356 \u56816 ','\u55356 \u56824 \u55356 \u56809 ','\u55356 \u56824 \u55356 \u56823 ','\u55356 \u56824 \u55356 \u56831 ','\u55356 \u56824 \u55356 \u56810 ','\u55356 \u56808 \u55356 \u56813 ','\u55356 \u56824 \u55356 \u56830 ','\u55356 \u56825 \u55356 \u56815 ','\u55356 \u56825 \u55356 \u56831 ','\u55356 \u56825 \u55356 \u56813 ','\u55356 \u56825 \u55356 \u56812 ','\u55356 \u56825 \u55356 \u56820 ','\u55356 \u56825 \u55356 \u56825 ','\u55356 \u56825 \u55356 \u56819 ','\u55356 \u56825 \u55356 \u56823 ','\u55356 \u56825 \u55356 \u56818 ','\u55356 \u56827 \u55356 \u56814 ','\u55356 \u56826 \u55356 \u56812 ','\u55356 \u56826 \u55356 \u56806 ','\u55356 \u56826 \u55356 \u56830 ','\u55356 \u56826 \u55356 \u56831 ','\u55356 \u56827 \u55356 \u56810 ','\u55356 \u56827 \u55356 \u56819 ','\u55356 \u56830 \u55356 \u56810 ','\u55356 \u56831 \u55356 \u56818 ','\u55356 \u56831 \u55356 \u56828 ','\u55356 \u56806 \u55356 \u56809 ','\u55356 \u56823 \u55356 \u56810 ','\u55356 \u56821 \u55356 \u56817 ','\u55356 \u56812 \u55356 \u56826 ','\u55356 \u56827 \u55356 \u56806 ','\u55356 \u56817 \u55356 \u56814 ','\u55356 \u56808 \u55356 \u56828 ','\u55356 \u56824 \u55356 \u56808 ','\u55356 \u56806 \u55356 \u56822 ','\u55356 \u56812 \u55356 \u56814 ','\u55356 \u56808 \u55356 \u56826 ','\u55356 \u56811 \u55356 \u56820 ','\u55356 \u56806 \u55356 \u56829 ','\u55356 \u56807 \u55356 \u56818 ','\u55356 \u56825 \u55356 \u56817 ','\u55356 \u56821 \u55356 \u56823 ','\u55356 \u56807 \u55356 \u56817 ','\u55356 \u56818 \u55356 \u56811 ','\u55356 \u56807 \u55356 \u56822 ','\u55356 \u56824 \u55356 \u56824 ','\u55356 \u56810 \u55356 \u56813 ','\u55356 \u56829 \u55356 \u56816 ','\u55356 \u56807 \u55356 \u56822 ','\u55356 \u56812 \u55356 \u56812 ','\u55356 \u56815 \u55356 \u56810 ','\u55356 \u56821 \u55356 \u56819 ','\u55356 \u56824 \u55356 \u56813 ','\u55356 \u56825 \u55356 \u56808 ','\u55356 \u56826 \u55356 \u56818 ','\u55356 \u56818 \u55356 \u56811 ','\u55356 \u56814 \u55356 \u56820 ','\u55356 \u56812 \u55356 \u56811 ','\u55356 \u56812 \u55356 \u56821 ','\u55356 \u56818 \u55356 \u56824 ','\u55356 \u56816 \u55356 \u56830 ','\u55356 \u56811 \u55356 \u56816 ','\u55356 \u56806 \u55356 \u56814 ','\u55356 \u56825 \u55356 \u56808 ']; // \'c8\'f4\'d0\'e8\'d7\'bc\'c8\'b7\'b8\'b2\'b8\'c7\'cb\'f9\'d3\'d0\'d0\'a1\'d6\'da code\'a3\'ac\'bf\'c9\'d4\'da\'b4\'cb\'c0\'a9\'d5\'b9\
\
// \'b9\'b9\'bd\'a8\'b9\'fa\'bc\'d2\'ca\'fd\'be\'dd\'bf\'e2\'a3\'bacode => \{code, zh, flag, idx\}\
const COUNTRY_DB = \{\};\
for (let i = 0; i < EN.length; i++) \{\
  const code = EN[i] ? EN[i].toUpperCase() : null;\
  if (!code) continue;\
  COUNTRY_DB[code] = \{\
    code,\
    zh: ZH[i] || code,\
    flag: FG[i] || "",\
    idx: i,\
  \};\
\}\
// \'b7\'bd\'b1\'e3\'b7\'b4\'b2\'e9\'a3\'ba\'d0\'a1\'d0\'b4 code -> code\
const COUNTRY_BY_TLD = \{\};\
Object.keys(COUNTRY_DB).forEach((c) => (COUNTRY_BY_TLD[c.toLowerCase()] = c));\
\
/* -----------------------------\
   \'cd\'ea\'d5\'fb\'d3\'f2\'c3\'fb / TLD \'d3\'b3\'c9\'e4\'a3\'a8TLD_MAP\'a3\'a9\
   \'ce\'d2\'c3\'c7\'c9\'fa\'b3\'c9\'bb\'f9\'d3\'da COUNTRY_BY_TLD \'b5\'c4\'b3\'a3\'bc\'fb ccTLD \'d3\'b3\'c9\'e4\'a3\'ac\'cd\'ac\'ca\'b1\'cc\'ed\'bc\'d3\'b3\'a3\'bc\'fb multi-level \'d3\'b3\'c9\'e4\'a3\'a8co.uk, com.au, etc\'a3\'a9\
   \'c8\'e7\'b9\'fb\'c4\'e3\'cf\'eb\'b0\'d1\'c3\'bf\'b8\'f6 gTLD/ccTLD \'b6\'bc\'c3\'f7\'c8\'b7\'d3\'b3\'c9\'e4\'b3\'c9\'c4\'b3\'b9\'fa\'a3\'ac\'bf\'c9\'d2\'d4\'d4\'da\'d5\'e2\'c0\'ef\'c0\'a9\'b3\'e4\'a3\'a8\'bd\'c5\'b1\'be\'d2\'d1\'d6\'a7\'b3\'d6\'a3\'a9\'a1\'a3\
------------------------------*/\
const TLD_MAP = Object.assign(\{\}, COUNTRY_BY_TLD, \{\
  // \'b3\'a3\'bc\'fb multi-level ccTLD \'d3\'b3\'c9\'e4\'a3\'a8\'b8\'b2\'b8\'c7\'d3\'c5\'cf\'c8\'a3\'a9\
  "co.uk": "GB",\
  "gov.uk": "GB",\
  "ac.uk": "GB",\
  "com.au": "AU",\
  "net.au": "AU",\
  "edu.au": "AU",\
  "com.sg": "SG",\
  "com.hk": "HK",\
  "com.tw": "TW",\
  "co.jp": "JP",\
  "ne.jp": "JP",\
  "or.jp": "JP",\
  "com.cn": "CN",\
  "net.cn": "CN",\
  "org.cn": "CN",\
  // \'cc\'d8\'ca\'e2\'ba\'cd\'b3\'a3\'bc\'fb gTLD\'a3\'a8\'d2\'bb\'b0\'e3\'ce\'de\'b7\'a8\'c8\'b7\'b6\'a8\'b9\'fa\'bc\'d2\'a3\'ac\'c4\'ac\'c8\'cf\'b2\'bb\'d3\'b3\'c9\'e4\'a3\'a9\
  // \'c8\'f4\'c4\'e3\'cf\'a3\'cd\'fb .io -> GB \'bb\'f2\'c6\'e4\'cb\'fb\'b9\'fa\'bc\'d2\'a3\'ac\'c7\'eb\'d4\'da\'b4\'cb\'b4\'a6\'cc\'ed\'bc\'d3.\
\});\
\
// \'c1\'ed\'cd\'e2\'cc\'e1\'b9\'a9\'d2\'bb\'b8\'f6\'ba\'f3\'d7\'ba\'d3\'c5\'cf\'c8\'ca\'fd\'d7\'e9\'a3\'a8\'c6\'a5\'c5\'e4 multi-level like co.uk\'a3\'a9\
const TLD_PRIORITY = [\
  "co.uk", "gov.uk", "ac.uk", "com.au", "net.au", "edu.au", "com.sg", "com.hk", "com.tw", "co.jp", "com.cn", "net.cn", "org.cn"\
];\
\
/* -----------------------------\
   \'c7\'e1\'c1\'bf\'c0\'eb\'cf\'df IP \'ca\'fd\'be\'dd\'bf\'e2 IP_DB (\'ca\'be\'c0\'fd/\'c6\'f4\'b6\'af\'bc\'af)\
   \'cb\'b5\'c3\'f7\'a3\'ba\'ce\'aa\'bf\'d8\'d6\'c6\'cc\'e5\'bb\'fd\'a3\'ac\'d5\'e2\'c0\'ef\'d6\'bb\'b7\'c5\'a1\'b0\'b3\'a3\'bc\'fb/\'b5\'e4\'d0\'cd/\'b4\'fa\'b1\'ed\'d0\'d4\'a1\'b1CIDR\'a1\'a3\'bd\'a8\'d2\'e9\'c4\'e3\'ba\'f3\'d0\'f8\'b0\'d1 GeoIP \'b5\'c4\'c0\'eb\'cf\'df CIDR\'a3\'a8\'c0\'fd\'c8\'e7 MaxMind \'b5\'c4 GeoLite2\'a3\'a9\'b5\'bc\'b3\'f6\'b3\'c9 JSON \'b2\'a2\'d7\'b7\'bc\'d3\'b5\'bd\'b4\'cb\'ca\'fd\'d7\'e9\'d2\'d4\'cc\'e1\'b8\'df\'c3\'fc\'d6\'d0\'c2\'ca\'a1\'a3\
   \'b8\'f1\'ca\'bd\'a3\'ba\{ cidr: "x.x.x.x/yy", country: "US" \}\
------------------------------*/\
const IP_DB = [\
  // \'b9\'ab\'b9\'b2 DNS / \'b3\'a3\'bc\'fb\'b7\'fe\'ce\'f1\'a3\'a8\'ca\'be\'c0\'fd\'a3\'a9\
  \{ cidr: "8.8.8.0/24", country: "US" \},     // Google DNS (\'b4\'fa\'b1\'ed US)\
  \{ cidr: "8.8.4.0/24", country: "US" \},\
  \{ cidr: "1.1.1.0/24", country: "AU" \},     // Cloudflare Anycast\'a3\'a8\'d7\'a2\'d2\'e2\'a3\'baanycast \'d4\'da\'c8\'ab\'c7\'f2\'d3\'d0\'bd\'da\'b5\'e3\'a3\'ac\'b5\'d8\'cd\'bc\'bd\'f6\'d7\'f7\'b2\'ce\'bf\'bc\'a3\'a9\
  \{ cidr: "9.9.9.0/24", country: "US" \},     // Quad9\
  \{ cidr: "114.114.114.0/24", country: "CN" \}, // \'d6\'d0\'b9\'fa\'d6\'aa\'c3\'fb DNS\
  \{ cidr: "119.29.29.0/24", country: "CN" \},\
  // \'b3\'a3\'bc\'fb\'d4\'c6\'b3\'a7\'c9\'cc\'b5\'e4\'d0\'cd /8 \'bb\'f2 /16 \'b6\'ce\'a3\'a8\'bd\'f6\'ca\'be\'c0\'fd\'a3\'ac\'cc\'ed\'bc\'d3\'b8\'fc\'b6\'e0\'bf\'c9\'cc\'e1\'b8\'df\'d7\'bc\'c8\'b7\'c2\'ca\'a3\'a9\
  \{ cidr: "3.0.0.0/8", country: "US" \},      // AWS\'a3\'a8\'b2\'bf\'b7\'d6\'a3\'a9\
  \{ cidr: "13.0.0.0/8", country: "US" \},     // AWS\
  \{ cidr: "35.0.0.0/8", country: "US" \},     // Google Cloud (\'b2\'bf\'b7\'d6)\
  \{ cidr: "34.0.0.0/8", country: "US" \},     // Google Cloud (\'b2\'bf\'b7\'d6)\
  \{ cidr: "52.0.0.0/8", country: "US" \},     // AWS (\'b2\'bf\'b7\'d6)\
  \{ cidr: "54.0.0.0/8", country: "US" \},     // AWS (\'b2\'bf\'b7\'d6)\
  \{ cidr: "23.0.0.0/8", country: "US" \},     // Akamai/Various\
  \{ cidr: "45.0.0.0/8", country: "US" \},     // Cloud/Various\
  \{ cidr: "103.0.0.0/8", country: "AS" \},    // Asia-Pacific (broad)\
  \{ cidr: "114.0.0.0/8", country: "CN" \},\
  \{ cidr: "27.0.0.0/8", country: "AU" \},     // APNIC (\'ca\'be\'c0\'fd)\
  \{ cidr: "49.0.0.0/8", country: "JP" \},     // Japan CDN (\'ca\'be\'c0\'fd)\
  // ... \'d5\'e2\'c0\'ef\'bf\'c9\'d2\'d4\'bc\'cc\'d0\'f8\'cc\'ed\'bc\'d3\'b8\'fc\'b6\'e0 CIDR \'b6\'ce\'d2\'d4\'c0\'a9\'b3\'e4\'b8\'b2\'b8\'c7\
];\
\
/* -----------------------------\
   IP / CIDR \'d6\'fa\'ca\'d6\'ba\'af\'ca\'fd\
------------------------------*/\
function ipToInt(ip) \{\
  // \'bd\'f6\'b4\'a6\'c0\'ed IPv4\
  const parts = ip.split(".");\
  if (parts.length !== 4) return null;\
  let num = 0;\
  for (let i = 0; i < 4; i++) \{\
    const p = parseInt(parts[i], 10);\
    if (isNaN(p) || p < 0 || p > 255) return null;\
    num = (num << 8) + p;\
  \}\
  return num >>> 0;\
\}\
\
function cidrToRange(cidr) \{\
  const [ip, prefix] = cidr.split("/");\
  const ipInt = ipToInt(ip);\
  const mask = prefix === undefined ? 32 : parseInt(prefix, 10);\
  const shift = 32 - mask;\
  const start = (ipInt >>> 0) & (~0 << shift) >>> 0;\
  const end = (start + (1 << shift) - 1) >>> 0;\
  return [start, end];\
\}\
\
const IP_DB_RANGES = IP_DB.map((e) => \{\
  const [s, t] = cidrToRange(e.cidr);\
  return \{ start: s, end: t, country: e.country \};\
\});\
\
function lookupIpCountry(ip) \{\
  const ipInt = ipToInt(ip);\
  if (ipInt === null) return null;\
  // \'d3\'c5\'cf\'c8\'be\'ab\'c8\'b7\'c6\'a5\'c5\'e4 IP_DB_RANGES\
  for (let i = 0; i < IP_DB_RANGES.length; i++) \{\
    const item = IP_DB_RANGES[i];\
    if (ipInt >= item.start && ipInt <= item.end) return item.country;\
  \}\
  return null; // \'ce\'b4\'c3\'fc\'d6\'d0\
\}\
\
/* -----------------------------\
   \'d3\'f2\'c3\'fb -> \'b9\'fa\'bc\'d2 \'ca\'b6\'b1\'f0\
   \'b9\'e6\'d4\'f2\'a3\'ba\
   1. \'b3\'a2\'ca\'d4\'c6\'a5\'c5\'e4 multi-level TLD\'a3\'a8co.uk, com.au \'b5\'c8\'a3\'a9\
   2. \'b7\'f1\'d4\'f2\'ca\'b9\'d3\'c3\'d7\'ee\'ba\'f3\'d2\'bb\'b6\'ce\'ba\'f3\'d7\'ba\'a3\'a8.jp -> JP\'a3\'a9\
   3. \'b6\'d4\'d3\'da\'b6\'fe\'bc\'b6\'d3\'f2\'c3\'fb\'d6\'d0\'ba\'ac country keyword\'a3\'a8\'c8\'e7 google.com.hk\'a3\'a9\'d2\'b2\'be\'a1\'c1\'bf\'ca\'b6\'b1\'f0\
------------------------------*/\
function lookupDomainCountry(domain) \{\
  if (!domain || typeof domain !== "string") return null;\
  domain = domain.trim().toLowerCase();\
\
  // \'c8\'a5\'b5\'f4\'b6\'cb\'bf\'da\
  domain = domain.replace(/:\\d+$/, "");\
\
  // \'bd\'ab domain \'b2\'f0\'b7\'d6\'b3\'c9 labels\
  const parts = domain.split(".");\
  if (parts.length < 2) return null;\
\
  // multi-level \'d3\'c5\'cf\'c8\'c6\'a5\'c5\'e4\'a3\'a8co.uk \'b5\'c8\'a3\'a9\
  for (const tld of TLD_PRIORITY) \{\
    if (domain.endsWith("." + tld) || domain === tld) \{\
      return TLD_MAP[tld.toLowerCase()] || null;\
    \}\
  \}\
\
  // \'c6\'a5\'c5\'e4\'d7\'ee\'ba\'f3\'d2\'bb\'b6\'ce\'ba\'f3\'d7\'ba\
  const last = parts[parts.length - 1];\
  if (TLD_MAP[last]) return TLD_MAP[last];\
\
  // \'cc\'d8\'ca\'e2\'b3\'a2\'ca\'d4\'a3\'ba\'c8\'f4\'b5\'da\'b6\'fe\'b6\'ce\'ca\'c7 country code\'a3\'a8\'c8\'e7 google.com.hk \'d6\'d0\'b5\'c4 hk\'a3\'a9\
  const secondLast = parts[parts.length - 2];\
  if (TLD_MAP[secondLast]) return TLD_MAP[secondLast];\
\
  // \'ce\'b4\'ca\'b6\'b1\'f0\
  return null;\
\}\
\
/* -----------------------------\
   \'d7\'d6\'b7\'fb\'b4\'ae\'ca\'c7\'b7\'f1\'ce\'aa IP / \'d3\'f2\'c3\'fb \'bc\'ec\'b2\'e2\
------------------------------*/\
function isIPv4(str) \{\
  return /^((25[0-5]|2[0-4]\\d|1?\\d\{1,2\})\\.)\{3\}(25[0-5]|2[0-4]\\d|1?\\d\{1,2\})$/.test(str);\
\}\
function isDomain(str) \{\
  // \'bc\'f2\'b5\'a5\'bc\'ec\'b2\'e2\'a3\'a8\'b2\'bb\'d7\'f6\'c8\'ab\'c1\'bf\'d0\'a3\'d1\'e9\'a3\'a9\
  return /^[a-z0-9\\-]+(\\.[a-z0-9\\-]+)+(:\\d+)?$/.test(str.toLowerCase());\
\}\
\
/* -----------------------------\
   \'bd\'ab\'b9\'fa\'bc\'d2\'b4\'fa\'c2\'eb\'d7\'aa\'bb\'bb\'ce\'aa\'cf\'d4\'ca\'be\'d7\'d6\'b7\'fb\'b4\'ae\'a3\'a8flag / \'d6\'d0\'ce\'c4 / \'d3\'a2\'ce\'c4\'cb\'f5\'d0\'b4 / \'c8\'ab\'b3\'c6\'a3\'a9\
------------------------------*/\
function formatCountry(countryCode, mode = "cn") \{\
  if (!countryCode) return \{ code: null, zh: "\'ce\'b4\'d6\'aa", flag: "", en: "unknown" \};\
  const code = countryCode.toUpperCase();\
  const rec = COUNTRY_DB[code];\
  if (!rec) return \{ code, zh: code, flag: "", en: code \};\
  return \{ code: rec.code, zh: rec.zh || rec.code, flag: rec.flag || "", en: rec.code \};\
\}\
\
/* -----------------------------\
   Fancy characters (\'d7\'d6\'cc\'e5\'d7\'aa\'bb\'bb) - TABLE \'c0\'b4\'d4\'b4\'d3\'da\'c4\'e3\'d4\'ad\'bd\'c5\'b1\'be\'a3\'a8\'b1\'a3\'c1\'f4\'a3\'a9\
   \'d6\'a7\'b3\'d6\'cd\'a8\'b9\'fd #type=xxx & num=yyy \'c0\'b4\'d6\'b8\'b6\'a8\'d7\'d6\'c4\'b8\'ba\'cd\'ca\'fd\'d7\'d6\'b7\'e7\'b8\'f1\
------------------------------*/\
const FANCY_TABLES = \{\
  "serif-bold": ["\uc0\u55349 \u57294 ","\u55349 \u57295 ","\u55349 \u57296 ","\u55349 \u57297 ","\u55349 \u57298 ","\u55349 \u57299 ","\u55349 \u57300 ","\u55349 \u57301 ","\u55349 \u57302 ","\u55349 \u57303 ","\u55349 \u56346 ","\u55349 \u56347 ","\u55349 \u56348 ","\u55349 \u56349 ","\u55349 \u56350 ","\u55349 \u56351 ","\u55349 \u56352 ","\u55349 \u56353 ","\u55349 \u56354 ","\u55349 \u56355 ","\u55349 \u56356 ","\u55349 \u56357 ","\u55349 \u56358 ","\u55349 \u56359 ","\u55349 \u56360 ","\u55349 \u56361 ","\u55349 \u56362 ","\u55349 \u56363 ","\u55349 \u56364 ","\u55349 \u56365 ","\u55349 \u56366 ","\u55349 \u56367 ","\u55349 \u56368 ","\u55349 \u56369 ","\u55349 \u56370 ","\u55349 \u56371 ","\u55349 \u56320 ","\u55349 \u56321 ","\u55349 \u56322 ","\u55349 \u56323 ","\u55349 \u56324 ","\u55349 \u56325 ","\u55349 \u56326 ","\u55349 \u56327 ","\u55349 \u56328 ","\u55349 \u56329 ","\u55349 \u56330 ","\u55349 \u56331 ","\u55349 \u56332 ","\u55349 \u56333 ","\u55349 \u56334 ","\u55349 \u56335 ","\u55349 \u56336 ","\u55349 \u56337 ","\u55349 \u56338 ","\u55349 \u56339 ","\u55349 \u56340 ","\u55349 \u56341 ","\u55349 \u56342 ","\u55349 \u56343 ","\u55349 \u56344 ","\u55349 \u56345 "],\
  "modifier-letter": ["\uc0\u8304 ", "\u185 ", "\u178 ", "\u179 ", "\u8308 ", "\u8309 ", "\u8310 ", "\u8311 ", "\u8312 ", "\u8313 ", "\u7491 ", "\u7495 ", "\u7580 ", "\u7496 ", "\u7497 ", "\u7584 ", "\u7501 ", "\u688 ", "\u8305 ", "\u690 ", "\u7503 ", "\u737 ", "\u7504 ", "\u8319 ", "\u7506 ", "\u7510 ", "\u7520 ", "\u691 ", "\u738 ", "\u7511 ", "\u7512 ", "\u7515 ", "\u695 ", "\u739 ", "\u696 ", "\u7611 ", "\u7468 ", "\u7470 ", "\u7580 ", "\u7472 ", "\u7473 ", "\u7584 ", "\u7475 ", "\u688 ", "\u7477 ", "\u7478 ", "\u7479 ", "\u7480 ", "\u7481 ", "\u7482 ", "\u7484 ", "\u7486 ", "\u7520 ", "\u7487 ", "\u738 ", "\u7488 ", "\u7489 ", "\u7515 ", "\u7490 ", "\u739 ", "\u696 ", "\u7611 "]\
  // \'c8\'f4\'d0\'e8\'cc\'ed\'bc\'d3\'b8\'fc\'b6\'e0\'b1\'ed\'a3\'ac\'c7\'eb\'b2\'b9\'b3\'e4\
\};\
const INDEX_MAP = \{ "48": 0, "49": 1, "50": 2, "51": 3, "52": 4, "53": 5, "54": 6, "55": 7, "56": 8, "57": 9, "65": 36, "66": 37, "67": 38, "68": 39, "69": 40, "70": 41, "71": 42, "72": 43, "73": 44, "74": 45, "75": 46, "76": 47, "77": 48, "78": 49, "79": 50, "80": 51, "81": 52, "82": 53, "83": 54, "84": 55, "85": 56, "86": 57, "87": 58, "88": 59, "89": 60, "90": 61, "97": 10, "98": 11, "99": 12, "100": 13, "101": 14, "102": 15, "103": 16, "104": 17, "105": 18, "106": 19, "107": 20, "108": 21, "109": 22, "110": 23, "111": 24, "112": 25, "113": 26, "114": 27, "115": 28, "116": 29, "117": 30, "118": 31, "119": 32, "120": 33, "121": 34, "122": 35 \};\
\
function applyFancy(p, type, numType) \{\
  if (!type && !numType) return p;\
  const TABLE_TYPE = FANCY_TABLES[type];\
  const TABLE_NUM = FANCY_TABLES[numType || type];\
  if (!TABLE_TYPE && !TABLE_NUM) return p;\
\
  return p.map(proxy => \{\
    proxy.name = [...proxy.name].map(c => \{\
      if (/[a-zA-Z0-9]/.test(c)) \{\
        const code = c.charCodeAt(0).toString();\
        const idx = INDEX_MAP[code];\
        if (idx === undefined) return c;\
        if (/[0-9]/.test(c) && TABLE_NUM) \{\
          return TABLE_NUM[idx] || c;\
        \}\
        if (TABLE_TYPE) \{\
          return TABLE_TYPE[idx] || c;\
        \}\
      \}\
      return c;\
    \}).join("");\
    return proxy;\
  \});\
\}\
\
/* -----------------------------\
   \'d4\'ad\'d3\'d0 rename \'d6\'f7\'c2\'df\'bc\'ad\'d3\'c5\'bb\'af\'a3\'a8\'d5\'fb\'ba\'cf\'b2\'a2\'be\'ab\'bc\'f2\'a3\'a9\
   \'b0\'fc\'c0\'a8\'a3\'ba\'b9\'d8\'bc\'fc\'b4\'ca\'b1\'a3\'c1\'f4\'a1\'a2\'d5\'fd\'d4\'f2\'bc\'ec\'b2\'e2\'a1\'a2\'cc\'e6\'bb\'bb\'a1\'a2\'d0\'f2\'ba\'c5\'a1\'a2\'c5\'c5\'d0\'f2\'a1\'a2bl/blgd \'b5\'c8\
------------------------------*/\
\
// \'d4\'ad\'ca\'bc\'b8\'a8\'d6\'fa data\'a3\'a8\'b1\'a3\'c1\'f4\'b5\'ab\'be\'ab\'bc\'f2\'a3\'a9\
const specialRegex = [\
  /(\\d\\.)?\\d+\'a1\'c1/,\
  /IPLC|IEPL|Kern|Edge|Pro|Std|Exp|Biz|Fam|Game|Buy|Zx|LB|Game/,\
];\
const nameclear = /(\'cc\'d7\'b2\'cd|\'b5\'bd\'c6\'da|\'d3\'d0\'d0\'a7|\'ca\'a3\'d3\'e0|\'b0\'e6\'b1\'be|\'d2\'d1\'d3\'c3|\'b9\'fd\'c6\'da|\'ca\'a7\'c1\'aa|\'b2\'e2\'ca\'d4|\'b9\'d9\'b7\'bd|\'cd\'f8\'d6\'b7|\'b1\'b8\'d3\'c3|\'c8\'ba|TEST|\'bf\'cd\'b7\'fe|\'cd\'f8\'d5\'be|\'bb\'f1\'c8\'a1|\'b6\'a9\'d4\'c4|\'c1\'f7\'c1\'bf|\'bb\'fa\'b3\'a1|\'cf\'c2\'b4\'ce|\'b9\'d9\'d6\'b7|\'c1\'aa\'cf\'b5|\'d3\'ca\'cf\'e4|\'b9\'a4\'b5\'a5|\'d1\'a7\'ca\'f5|USE|USED|TOTAL|EXPIRE|EMAIL)/i;\
const regexArray = [/\uc0\u739 \u178 /, /\u739 \u179 /, /\u739 \u8308 /, /\u739 \u8309 /, /\u739 \u8310 /, /\u739 \u8311 /, /\u739 \u8312 /, /\u739 \u8313 /, /\u739 \u185 \u8304 /, /\u739 \u178 \u8304 /, /\u739 \u179 \u8304 /, /\u739 \u8308 \u8304 /, /\u739 \u8309 \u8304 /, /IPLC/i, /IEPL/i, /\'ba\'cb\'d0\'c4/, /\'b1\'df\'d4\'b5/, /\'b8\'df\'bc\'b6/, /\'b1\'ea\'d7\'bc/, /\'ca\'b5\'d1\'e9/, /\'c9\'cc\'bf\'ed/, /\'bc\'d2\'bf\'ed/, /\'d3\'ce\'cf\'b7|game/i, /\'b9\'ba\'ce\'ef/, /\'d7\'a8\'cf\'df/, /LB/, /cloudflare/i, /\\budp\\b/i, /\\bgpt\\b/i,/udpn\\b/];\
const valueArray = [ "2\'a1\'c1","3\'a1\'c1","4\'a1\'c1","5\'a1\'c1","6\'a1\'c1","7\'a1\'c1","8\'a1\'c1","9\'a1\'c1","10\'a1\'c1","20\'a1\'c1","30\'a1\'c1","40\'a1\'c1","50\'a1\'c1","IPLC","IEPL","Kern","Edge","Pro","Std","Exp","Biz","Fam","Game","Buy","Zx","LB","CF","UDP","GPT","UDPN"];\
const nameblnx = /(\'b8\'df\'b1\'b6|(?!1)2+(x|\'b1\'b6)|\uc0\u739 \u178 |\u739 \u179 |\u739 \u8308 |\u739 \u8309 |\u739 \u185 \u8304 )/i;\
const namenx = /(\'b8\'df\'b1\'b6|(?!1)(0\\.|\\d)+(x|\'b1\'b6)|\uc0\u739 \u178 |\u739 \u179 |\u739 \u8308 |\u739 \u8309 |\u739 \u185 \u8304 )/i;\
const keya = /\'b8\'db|Hong|HK|\'d0\'c2\'bc\'d3\'c6\'c2|SG|Singapore|\'c8\'d5\'b1\'be|Japan|JP|\'c3\'c0\'b9\'fa|United States|US|\'ba\'ab|\'cd\'c1\'b6\'fa\'c6\'e4|TR|Turkey|Korea|KR|\uc0\u55356 \u56824 \u55356 \u56812 |\u55356 \u56813 \u55356 \u56816 |\u55356 \u56815 \u55356 \u56821 |\u55356 \u56826 \u55356 \u56824 |\u55356 \u56816 \u55356 \u56823 |\u55356 \u56825 \u55356 \u56823 /i;\
const keyb = /(((1|2|3|4)\\d)|(\'cf\'e3\'b8\'db|Hong|HK) 0[5-9]|((\'d0\'c2\'bc\'d3\'c6\'c2|SG|Singapore|\'c8\'d5\'b1\'be|Japan|JP|\'c3\'c0\'b9\'fa|United States|US|\'ba\'ab|\'cd\'c1\'b6\'fa\'c6\'e4|TR|Turkey|Korea|KR) 0[3-9]))/i;\
\
// \'d4\'ad\'bd\'c5\'b1\'be\'b5\'c4 rurekey\'a3\'a8\'d3\'c3\'d3\'da\'cc\'e6\'bb\'bb\'b3\'a4\'b5\'d8\'c3\'fb\'a3\'a9\
const rurekey = \{\
  GB: /UK/g,\
  "B-G-P": /BGP/g,\
  "Russia Moscow": /Moscow/g,\
  "Korea Chuncheon": /Chuncheon|Seoul/g,\
  "Hong Kong": /Hongkong|HONG KONG/gi,\
  "United Kingdom London": /London|Great Britain/g,\
  "Dubai United Arab Emirates": /United Arab Emirates/g,\
  "Taiwan TW \'cc\'a8\'cd\'e5 \uc0\u55356 \u56825 \u55356 \u56828 ": /(\'cc\'a8|Tai\\s?wan|TW).*?\u55356 \u56808 \u55356 \u56819 |\u55356 \u56808 \u55356 \u56819 .*?(\'cc\'a8|Tai\\s?wan|TW)/g,\
  "United States": /USA|Los Angeles|San Jose|Silicon Valley|Michigan/g,\
  \'b0\'c4\'b4\'f3\'c0\'fb\'d1\'c7: /\'b0\'c4\'d6\'de|\'c4\'ab\'b6\'fb\'b1\'be|\'cf\'a4\'c4\'e1|\'cd\'c1\'b0\'c4|(\'c9\'ee|\'bb\'a6|\'ba\'f4|\'be\'a9|\'b9\'e3|\'ba\'bc)\'b0\'c4/g,\
  \'b5\'c2\'b9\'fa: /(\'c9\'ee|\'bb\'a6|\'ba\'f4|\'be\'a9|\'b9\'e3|\'ba\'bc)\'b5\'c2(?!.*(I|\'cf\'df))|\'b7\'a8\'c0\'bc\'bf\'cb\'b8\'a3|\'9c\'fb\'b5\'c2/g,\
  \'cf\'e3\'b8\'db: /(\'c9\'ee|\'bb\'a6|\'ba\'f4|\'be\'a9|\'b9\'e3|\'ba\'bc)\'b8\'db(?!.*(I|\'cf\'df))/g,\
  \'c8\'d5\'b1\'be: /(\'c9\'ee|\'bb\'a6|\'ba\'f4|\'be\'a9|\'b9\'e3|\'ba\'bc|\'d6\'d0|\'c1\'c9)\'c8\'d5(?!.*(I|\'cf\'df))|\'b6\'ab\'be\'a9|\'b4\'f3\'db\'e0/g,\
  \'d0\'c2\'bc\'d3\'c6\'c2: /\'ca\'a8\'b3\'c7|(\'c9\'ee|\'bb\'a6|\'ba\'f4|\'be\'a9|\'b9\'e3|\'ba\'bc)\'d0\'c2/g,\
  \'c3\'c0\'b9\'fa: /(\'c9\'ee|\'bb\'a6|\'ba\'f4|\'be\'a9|\'b9\'e3|\'ba\'bc)\'c3\'c0|\'b2\'a8\'cc\'d8\'c0\'bc|\'d6\'a5\'bc\'d3\'b8\'e7|\'b8\'e7\'c2\'d7\'b2\'bc|\'c5\'a6\'d4\'bc|\'b9\'e8\'b9\'c8|\'b6\'ed\'c0\'d5\'b8\'d4|\'ce\'f7\'d1\'c5\'cd\'bc|\'d6\'a5\'bc\'d3\'b8\'e7/g,\
  // ... \'c8\'e7\'d0\'e8\'b8\'fc\'b6\'e0\'bf\'c9\'c0\'a9\'b3\'e4\
\};\
\
/* -----------------------------\
   \'d6\'f7\'b4\'a6\'c0\'ed\'ba\'af\'ca\'fd operator(proxies)\
   proxies: Array of objects \{ name: "\'bd\'da\'b5\'e3\'c3\'fb", ... \}\'a3\'a8Sub-Store \'bb\'f2 ScriptHub \'d6\'d0\'b5\'c4\'bd\'da\'b5\'e3\'b6\'d4\'cf\'f3\'a3\'a9\
   \'b7\'b5\'bb\'d8\'b4\'a6\'c0\'ed\'ba\'f3\'b5\'c4 proxies \'ca\'fd\'d7\'e9\'a3\'a8\'d6\'d8\'c3\'fc\'c3\'fb\'a1\'a2\'cc\'ed\'bc\'d3\'d0\'f2\'ba\'c5\'a1\'a2\'b1\'a3\'c1\'f4/\'b9\'fd\'c2\'cb\'b5\'c8\'a3\'a9\
------------------------------*/\
function operator(proxies) \{\
  // 1. \'b2\'ce\'ca\'fd\'d7\'bc\'b1\'b8\
  const BLKEYS = BLKEY ? BLKEY.split("+") : [];\
  let GetK = false;\
  let Allmap = buildAllMap(outputName); // \'ca\'b9\'d3\'c3\'ca\'e4\'b3\'f6\'b8\'f1\'ca\'bd\'b9\'b9\'bd\'a8\'d3\'b3\'c9\'e4\'b1\'ed\'a3\'a8\'d4\'ad\'bd\'c5\'b1\'be Allmap\'a3\'a9\
\
  // 2. \'b3\'f5\'c9\'b8\'a3\'a8clear / nx / blnx / key\'a3\'a9\
  if (clear || nx || blnx || key) \{\
    proxies = proxies.filter((res) => \{\
      const resname = res.name || "";\
      const shouldKeep =\
        !(clear && nameclear.test(resname)) &&\
        !(nx && namenx.test(resname)) &&\
        !(blnx && !nameblnx.test(resname)) &&\
        !(key && !(keya.test(resname) && /2|4|6|7/i.test(resname)));\
      return shouldKeep;\
    \});\
  \}\
\
  // 3. \'d6\'f0\'cc\'f5\'b4\'a6\'c0\'ed\
  proxies.forEach((p) => \{\
    let originalName = p.name || "";\
    let nameWorking = originalName;\
    // \'d4\'a4\'b4\'a6\'c0\'ed\'a3\'ba\'cc\'e6\'bb\'bb\'b3\'a4\'b5\'d8\'c3\'fb\'a3\'a8rurekey\'a3\'a9\
    Object.keys(rurekey).forEach((k) => \{\
      const reg = rurekey[k];\
      if (reg && reg.test(nameWorking)) \{\
        nameWorking = nameWorking.replace(reg, k);\
      \}\
    \});\
\
    // \'b4\'a6\'c0\'ed block-quic \'d1\'a1\'cf\'ee\
    if (blockquicOpt === "on") \{\
      p["block-quic"] = "on";\
    \} else if (blockquicOpt === "off") \{\
      p["block-quic"] = "off";\
    \} else \{\
      delete p["block-quic"];\
    \}\
\
    // \'b4\'a6\'c0\'ed BLKEY \'b1\'a3\'c1\'f4\'b9\'d8\'bc\'fc\'b4\'ca\
    let retainKey = [];\
    if (BLKEY) \{\
      const tokens = BLKEY.split("+");\
      tokens.forEach((tk) => \{\
        if (!tk) return;\
        if (tk.includes(">")) \{\
          const [from, to] = tk.split(">");\
          if (nameWorking.includes(from)) \{\
            retainKey.push(to || from);\
          \}\
        \} else \{\
          if (nameWorking.includes(tk)) retainKey.push(tk);\
        \}\
      \});\
    \}\
\
    // \'ca\'b6\'b1\'f0\'b1\'b6\'c2\'ca\'d0\'c5\'cf\'a2 bl/blgd\
    let ikey = "", ikeys = "";\
    if (bl) \{\
      const match = nameWorking.match(/((\'b1\'b6\'c2\'ca|X|x|\'a1\'c1)\\D?((\\d\{1,3\}\\.)?\\d+)\\D?)|((\\d\{1,3\}\\.)?\\d+)(\'b1\'b6|X|x|\'a1\'c1)/);\
      if (match) \{\
        const rev = match[0].match(/(\\d[\\d.]*)/)[0];\
        if (rev !== "1") \{\
          ikey = rev + "\'a1\'c1";\
        \}\
      \}\
    \}\
    if (blgd) \{\
      regexArray.forEach((regex, idx) => \{\
        if (regex.test(nameWorking)) ikeys = valueArray[idx];\
      \});\
    \}\
\
    // ------------- \'c0\'eb\'cf\'df\'b5\'d8\'c0\'ed\'ca\'b6\'b1\'f0\'bf\'aa\'ca\'bc ----------------\
    // \'ca\'b6\'b1\'f0\'b9\'e6\'d4\'f2\'a3\'ba\
    // 1. \'c8\'e7\'b9\'fb nameWorking \'c3\'f7\'cf\'d4\'b0\'fc\'ba\'ac\'b9\'fa\'bc\'d2\'b9\'d8\'bc\'fc\'b4\'ca\'a3\'a8\'d4\'ad\'b9\'e6\'d4\'f2\'a3\'a9\'a3\'ac\'d4\'f2\'d2\'d4\'d6\'ae\'ce\'aa\'d7\'bc\'a3\'bb\
    // 2. \'b7\'f1\'d4\'f2\'a3\'ba\'c5\'d0\'b6\'cf\'bd\'da\'b5\'e3\'c3\'fb\'ca\'c7\'b7\'f1\'bd\'f6\'ce\'aa IP \'bb\'f2\'b4\'bf\'d3\'f2\'c3\'fb\'a3\'a8\'bb\'f2\'d2\'d4 IP/\'d3\'f2\'c3\'fb \'bf\'aa\'cd\'b7\'a3\'a9\'a3\'ac\'c8\'f4\'ca\'c7\'d4\'f2\'b3\'a2\'ca\'d4\'c0\'eb\'cf\'df\'ca\'b6\'b1\'f0\'a3\'ba\
    //    a. \'c8\'f4\'ce\'aa IP -> IP_DB \'c6\'a5\'c5\'e4\
    //    b. \'c8\'f4\'ce\'aa domain -> TLD_MAP \'c6\'a5\'c5\'e4\
    // 3. \'ca\'b6\'b1\'f0\'b5\'bd\'b9\'fa\'bc\'d2\'ba\'f3\'b9\'b9\'bd\'a8\'d7\'ee\'d6\'d5 node name\'a3\'a8\'b8\'f9\'be\'dd outArg / flag / name \'c7\'b0\'d7\'ba\'b5\'c8\'a3\'a9\
    let detectedCountry = null; // ISO code\
    // \'d3\'c5\'cf\'c8\'a3\'ba\'d4\'ad\'d3\'d0 findKey\'a3\'a8Allmap \'c6\'a5\'c5\'e4\'a3\'a9\'a1\'aa\'a1\'aa \'b1\'a3\'b3\'d6\'d4\'ad\'c2\'df\'bc\'ad\'a3\'a8Allmap \'bb\'f9\'d3\'da\'ca\'e4\'c8\'eb\'d3\'ef\'d1\'d4\'bf\'e2\'a3\'a9\
    const AMK = Object.entries(Allmap || \{\});\
    const findKey = AMK.find(([k, val]) => (nameWorking || "").includes(k));\
    if (findKey && findKey[1]) \{\
      detectedCountry = findKey[1];\
    \} else \{\
      // \'bc\'ec\'b2\'e9\'ca\'c7\'b7\'f1\'b0\'fc\'ba\'ac IP \'bb\'f2 \'d3\'f2\'c3\'fb\
      const tokens = nameWorking.split(/\\s+/).filter(Boolean);\
      // \'c8\'e7\'b9\'fb\'d5\'fb\'cc\'f5 name \'d6\'bb\'d3\'d0 IP \'bb\'f2 \'d6\'bb\'d3\'d0\'d3\'f2\'c3\'fb\'a3\'ac\'ca\'b6\'b1\'f0\'d3\'c5\'cf\'c8\'d0\'d4\'d7\'ee\'b8\'df\
      if (tokens.length === 1 && isIPv4(tokens[0])) \{\
        const ip = tokens[0];\
        const byIp = lookupIpCountry(ip);\
        if (byIp) detectedCountry = byIp;\
      \} else if (tokens.length === 1 && isDomain(tokens[0])) \{\
        const dm = tokens[0];\
        const byDomain = lookupDomainCountry(dm);\
        if (byDomain) detectedCountry = byDomain;\
      \} else \{\
        // \'bd\'cf\'b8\'b4\'d4\'d3\'c3\'fb\'d7\'d6\'a3\'ba\'b3\'a2\'ca\'d4\'b4\'d3\'c8\'ce\'d2\'e2 token \'d6\'d0\'b3\'e9\'c8\'a1 domain \'bb\'f2 ip\
        for (const tk of tokens) \{\
          if (isIPv4(tk)) \{\
            const byIp = lookupIpCountry(tk);\
            if (byIp) \{ detectedCountry = byIp; break; \}\
          \}\
          if (isDomain(tk)) \{\
            const byDomain = lookupDomainCountry(tk);\
            if (byDomain) \{ detectedCountry = byDomain; break; \}\
          \}\
        \}\
      \}\
    \}\
\
    // ------------- \'bd\'e1\'ca\'f8\'ca\'b6\'b1\'f0 ----------------\
\
    // \'b8\'f9\'be\'dd\'bc\'ec\'b2\'e2\'bd\'e1\'b9\'fb\'b9\'b9\'d4\'ec\'ca\'e4\'b3\'f6\'c3\'fb\'b3\'c6\
    let finalParts = [];\
    // nf \'b2\'ce\'ca\'fd\'be\'f6\'b6\'a8\'c7\'b0\'d7\'ba\'b7\'c5\'d4\'da\'d7\'ee\'c7\'b0\'bb\'f2\'d7\'ee\'c7\'b0\'c3\'e6\
    if (nf && FNAME) finalParts.push(FNAME);\
    if (detectedCountry) \{\
      const form = formatCountry(detectedCountry, outputName || "cn");\
      // \'c8\'e7\'b9\'fb\'d3\'c3\'bb\'a7\'d2\'aa\'c7\'f3\'bc\'d3 flag\
      if (addflag) finalParts.push(form.flag || "");\
      // \'b8\'f9\'be\'dd out \'b2\'ce\'ca\'fd\'d1\'a1\'d4\'f1\'ca\'e4\'b3\'f6\'c4\'da\'c8\'dd\
      if (outputName === "us") \{\
        finalParts.push(form.code);\
      \} else if (outputName === "gq") \{\
        finalParts.push(form.flag || form.zh || form.code);\
      \} else if (outputName === "quan") \{\
        finalParts.push(form.en || form.code);\
      \} else \{\
        finalParts.push(form.zh || form.code);\
      \}\
    \} else \{\
      // \'ce\'b4\'ca\'b6\'b1\'f0\'b9\'fa\'bc\'d2\
      if (nm) \{\
        // \'b1\'a3\'c1\'f4\'d4\'ad\'c3\'fb\'b2\'a2\'bc\'d3\'c7\'b0\'d7\'ba\
        if (!nf && FNAME) finalParts.push(FNAME);\
        finalParts.push(nameWorking);\
      \} else \{\
        // \'c8\'f4\'d3\'c3\'bb\'a7\'c3\'bb\'d3\'d0\'d2\'aa\'c7\'f3\'b1\'a3\'c1\'f4\'ce\'b4\'ca\'b6\'b1\'f0\'bd\'da\'b5\'e3\'a3\'ac\'d4\'f2\'c3\'fc\'c3\'fb\'ce\'aa null\'a3\'a8\'ba\'f3\'c3\'e6\'bb\'e1\'b9\'fd\'c2\'cb\'a3\'a9\
        p.name = null;\
        return;\
      \}\
    \}\
\
    // \'cc\'ed\'bc\'d3\'b1\'a3\'c1\'f4\'b9\'d8\'bc\'fc\'b4\'ca/\'b1\'b6\'c2\'ca\'d0\'c5\'cf\'a2\
    if (retainKey && retainKey.length) finalParts.push(...retainKey);\
    if (ikey) finalParts.push(ikey);\
    if (ikeys) finalParts.push(ikeys);\
    if (!nf && FNAME && nm === false && detectedCountry) \{\
      // \'b5\'b1 nf \'ce\'b4\'c9\'e8\'b6\'a8\'a3\'ac\'bd\'ab name \'b7\'c5\'d4\'da\'ba\'f3\
      finalParts = finalParts.concat([FNAME].filter(Boolean));\
    \}\
\
    // \'d7\'e9\'d7\'b0\'d7\'ee\'d6\'d5\'c3\'fb\'b3\'c6\'a3\'a8\'d3\'c3\'b7\'d6\'b8\'f4\'b7\'fb FGF\'a3\'a9\
    const newName = finalParts.filter(Boolean).join(FGF).trim();\
    p.name = newName || null;\
  \}); // end proxies.forEach\
\
  // \'b9\'fd\'c2\'cb\'b5\'f4 name \'ce\'aa null \'b5\'c4\'b4\'fa\'c0\'ed\
  proxies = proxies.filter(p => p.name !== null && typeof p.name !== "undefined");\
\
  // \'d0\'f2\'ba\'c5\'c2\'df\'bc\'ad\'a3\'a8\'ba\'cf\'b2\'a2\'cf\'e0\'cd\'ac\'c3\'fb\'b3\'c6\'b2\'a2\'b2\'b9\'d0\'f2\'ba\'c5\'a3\'a9\
  proxies = addSequenceNumbers(proxies);\
\
  // blpx \'c5\'c5\'d0\'f2\'a3\'a8\'c8\'f4\'d0\'e8\'d2\'aa\'a3\'a9\
  if (blpx) proxies = fampx(proxies);\
\
  // key \'c9\'b8\'b3\'fd\'a3\'a8\'c8\'f4 key \'b2\'ce\'ca\'fd\'a3\'a9\
  if (key) proxies = proxies.filter((e) => !keyb.test(e.name));\
\
  // fancy \'d7\'d6\'cc\'e5\'a3\'a8\'d7\'ee\'ba\'f3\'d2\'bb\'b2\'bd\'a3\'a9\
  if (fontType || fontNumType) proxies = applyFancy(proxies, fontType, fontNumType);\
\
  return proxies;\
\}\
\
/* -----------------------------\
   \'b8\'a8\'d6\'fa\'a3\'ba\'b9\'b9\'bd\'a8 Allmap (\'ca\'e4\'b3\'f6\'d3\'b3\'c9\'e4\'b1\'ed) - \'d3\'c3\'d3\'da\'b9\'d8\'bc\'fc\'b4\'ca\'ca\'b6\'b1\'f0\'a3\'a8\'b8\'b4\'bf\'cc\'d4\'ad\'bd\'c5\'b1\'be\'cb\'bc\'c2\'b7\'a3\'a9\
   arg: outputName: 'us' | 'gq' | 'quan' | 'cn'\
------------------------------*/\
function buildAllMap(outputName) \{\
  const Allmap = \{\};\
  const outList = getList(outputName);\
  let inputLists;\
  if (inname !== "") \{\
    inputLists = [getList(inname)];\
  \} else \{\
    inputLists = [ZH, FG, QC, EN].filter(Boolean);\
  \}\
  inputLists.forEach(arr => \{\
    arr.forEach((v, idx) => \{\
      if (!v) return;\
      Allmap[v] = outList[idx] || outList[idx];\
    \});\
  \});\
  return Allmap;\
\}\
\
/* -----------------------------\
   getList helper\
------------------------------*/\
function getList(arg) \{\
  switch (arg) \{\
    case 'us': return EN;\
    case 'gq': return FG;\
    case 'quan': return QC;\
    default: return ZH;\
  \}\
\}\
\
/* -----------------------------\
   \'d0\'f2\'ba\'c5\'d3\'eb\'b7\'d6\'d7\'e9: addSequenceNumbers\
   \'d7\'f7\'d3\'c3\'a3\'ba\'b0\'d1\'cd\'ac\'c3\'fb\'bd\'da\'b5\'e3\'ba\'cf\'b2\'a2\'ce\'aa \'b4\'f8\'d0\'f2\'ba\'c5\'b5\'c4\'bd\'da\'b5\'e3\'c3\'fb\'a3\'a8... 01, 02 ...\'a3\'a9\
------------------------------*/\
function addSequenceNumbers(list) \{\
  const map = \{\};\
  for (const item of list) \{\
    const key = item.name;\
    if (!map[key]) map[key] = [];\
    map[key].push(item);\
  \}\
  const out = [];\
  Object.keys(map).forEach(k => \{\
    const arr = map[k];\
    if (arr.length === 1) \{\
      // \'c8\'e7\'b9\'fb\'d6\'bb\'d3\'d0\'d2\'bb\'b8\'f6\'b2\'a2\'c7\'d2 numone \'b2\'ce\'ca\'fd\'ce\'aa true\'a3\'ac\'d4\'f2\'c8\'a5\'b5\'f4 01\'a3\'a8\'b8\'f9\'be\'dd\'d4\'ad\'bd\'c5\'b1\'be\'c2\'df\'bc\'ad\'a3\'a9\
      const single = \{ ...arr[0] \};\
      if (numone && single.name.match(/01$/)) \{\
        single.name = single.name.replace(/[^.]01$/, "");\
      \}\
      out.push(single);\
    \} else \{\
      // \'b6\'e0\'b8\'f6\'d4\'f2\'b0\'b4\'d4\'ad\'cb\'b3\'d0\'f2\'b2\'b9 01,02...\
      for (let i = 0; i < arr.length; i++) \{\
        const it = \{ ...arr[i] \};\
        it.name = `$\{it.name\}$\{XHFGF\}$\{String(i + 1).padStart(2, "0")\}`;\
        out.push(it);\
      \}\
    \}\
  \});\
  return out;\
\}\
\
/* -----------------------------\
   fampx: \'cc\'d8\'b6\'a8\'c5\'c5\'d0\'f2\'a3\'a8\'b0\'d1\'ba\'ac specialRegex \'b5\'c4\'b7\'c5\'ba\'f3\'a3\'a9\
------------------------------*/\
function fampx(pro) \{\
  const wis = [], wnout = [];\
  for (const proxy of pro) \{\
    const fan = specialRegex.some((regex) => regex.test(proxy.name));\
    if (fan) wis.push(proxy);\
    else wnout.push(proxy);\
  \}\
  // \'b1\'a3\'b3\'d6\'d4\'ad\'d0\'f2\
  return wnout.concat(wis);\
\}\
\
/* -----------------------------\
   \'b5\'bc\'b3\'f6\'bb\'f2\'d4\'da Sub-Store \'bb\'b7\'be\'b3\'d6\'d0\'b9\'d2\'d4\'d8\'a3\'a8\'bc\'e6\'c8\'dd\'d0\'d4\'a3\'a9\
   Sub-Store \'cd\'a8\'b3\'a3\'bb\'e1\'b5\'f7\'d3\'c3 operator(proxies)\
------------------------------*/\
if (typeof module !== "undefined" && module.exports) \{\
  module.exports = \{ operator \};\
\} else \{\
  // \'d4\'da\'d6\'a7\'b3\'d6 script \'bb\'b7\'be\'b3\'cf\'c2\'a3\'ac\'b1\'a9\'c2\'b6\'ce\'aa\'c8\'ab\'be\'d6\'ba\'af\'ca\'fd\'a3\'a8Sub-Store \'bb\'e1\'d6\'b1\'bd\'d3\'b5\'f7\'d3\'c3 operator\'a3\'a9\
  this.operator = operator;\
\}\
\
/* -----------------------------\
   DEBUG / \'bf\'aa\'b7\'a2\'cb\'b5\'c3\'f7\
   - \'c8\'f4\'d2\'aa\'c0\'a9\'b3\'e4 IP \'ca\'fd\'be\'dd\'bf\'e2\'a3\'ba\'b0\'d1 GeoIP \'b5\'bc\'b3\'f6\'b3\'c9 CIDR \'c1\'d0\'b1\'ed\'b2\'a2 push \'b5\'bd IP_DB\'a3\'a8format \{cidr: "x.x.x.x/yy", country: "CN"\}\'a3\'a9\
   - \'c8\'f4\'d2\'aa\'c0\'a9\'b3\'e4\'d3\'f2\'c3\'fb\'d3\'b3\'c9\'e4\'a3\'ba\'d4\'da TLD_MAP \'d6\'d0\'d4\'f6\'bc\'d3 key:value \'b6\'d4\'a3\'a8key \'d0\'a1\'d0\'b4\'a3\'a9\
   - \'c8\'f4\'d0\'e8\'b8\'fc\'be\'ab\'c8\'b7\'b5\'c4\'b9\'fa\'bc\'d2\'c3\'fb\'b3\'c6\'a3\'a8EN/ZH/FLAG\'a3\'a9\'a3\'ac\'bf\'c9\'d6\'b1\'bd\'d3\'b8\'fc\'d0\'c2 EN/ZH/FG \'ca\'fd\'d7\'e9\'a3\'a8\'cb\'f7\'d2\'fd\'d2\'bb\'d2\'bb\'b6\'d4\'d3\'a6\'a3\'a9\
   - \'c8\'f4\'d0\'e8\'b0\'d1 domain -> city/region \'d2\'b2\'d7\'f6\'c0\'eb\'cf\'df\'c6\'a5\'c5\'e4\'a3\'ac\'d4\'f2\'b1\'d8\'d0\'eb\'d2\'fd\'c8\'eb\'b4\'f8 city \'ca\'fd\'be\'dd\'b5\'c4 GeoIP\'a3\'a8\'cc\'e5\'bb\'fd\'bd\'cf\'b4\'f3\'a3\'a9\
------------------------------*/\
\
if (debug) \{\
  console.log("rename_offline_geo.js loaded");\
  console.log("args:", args);\
  console.log("IP_DB sample count:", IP_DB.length);\
\}\
}