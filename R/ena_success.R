
library(rENA, warn.conflicts=F)
library(rJava, warn.conflicts=F)
library(xlsx, warn.conflicts=F)

# 读入xlsx编码结果数据
STEM.data = read.xlsx("C:\\wamp64\\www\\ena\\xlsx\\encode.xlsx", 1) 

library(htmltools, warn.conflicts=F)
library(plotly, warn.conflicts=F)
library(dplyr, warn.conflicts=F)
library(lme4, warn.conflicts=F)

args <- commandArgs(TRUE)
color1 <- args[1]
color2 <- args[2]

# 确定分析单位是每个班级每个小组的每个学生
units = STEM.data[,c("classID","gpID","gpNO")]
# head(units)

# 确定会话是每个班每个小组的每次讨论活动
conversation = STEM.data[,c("classID","gpID","taskID")]
# head(conversation)

# 确定讨论内容的编码方案，包括的编码有：学情分析能力、学习目标设计能力、
# 学习情境设计能力、知识内容设计能力、学习活动设计能力、技术整合能力、学习评价设计能力
codeCols = c(
  'analysis','objective','context','knowledge','activity','technology','evaluation'
)
codes = STEM.data[,codeCols]

#计算累计邻接向量，定义节的大小是5行
accum = ena.accumulate.data(
  units = units,
  conversation = conversation,
  codes = codes,
  window.size.back = 5
)

#计算绘制网络图的相关参数
set = ena.make.set(enadata = accum)

## 绘制各个分析单位的质心

class1.points = as.matrix(set$points[classID==1])
head(class1.points)
class2.points = as.matrix(set$points[classID==2])

# 绘制两个班级所有学生网络图的质心
enaplot = ena.plot(set, scale.to = "points", title = "Groups of Units")  %>%
  ena.plot.points(points = class1.points, colors = c("blue"))  %>%
  ena.plot.points(points = class2.points, colors = c("red"))

# htmlwidgets::saveWidget(enaplot$plot, file="./output.html")
setwd("../output")
htmlwidgets::saveWidget(enaplot$plot, file="./output.html")