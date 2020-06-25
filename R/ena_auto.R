library(rENA, warn.conflicts=F)
library(rJava, warn.conflicts=F)
library(xlsx, warn.conflicts=F)
library(htmltools, warn.conflicts=F)
library(plotly, warn.conflicts=F)
library(dplyr, warn.conflicts=F)
library(lme4, warn.conflicts=F)

# 读入xlsx编码结果数据
STEM.data = read.xlsx("C:\\wamp64\\www\\ena\\xlsx\\encode.xlsx", 1)

# 确定分析单位
units = STEM.data[,c("classID","gpID")]

# 确定会话
conversation = STEM.data[,c("classID","gpNO")]

# 确定讨论内容的编码方案
codeCols = c("analysis","objective","context","knowledge","activity","technology","evaluation")
codes = STEM.data[,codeCols]

# 计算累计邻接向量，定义节的大小是5行
accum = ena.accumulate.data(units = units,conversation = conversation,codes = codes,window.size.back = 5)

# 计算绘制网络图的相关参数
set = ena.make.set(enadata = accum)

# 绘制各个分析单位的质心
target1.points = as.matrix(set$points[classID==1])
target2.points = as.matrix(set$points[classID==2])

# 绘制平均质心及置信区间
enaplot = ena.plot(set, scale.to = "points", title = "Groups and Means")  %>%
  ena.plot.points(points = target1.points, confidence.interval = "box", colors = c("#4f81bd")) %>%
  ena.plot.group(point = target1.points, colors =c("#4f81bd"), confidence.interval = "box") %>%
  ena.plot.points(points = target2.points, confidence.interval = "box", colors = c("#c0504d")) %>%
  ena.plot.group(point = target2.points, colors =c("#c0504d"), confidence.interval = "box") 

setwd("../output")
htmlwidgets::saveWidget(enaplot$plot, file="./output.html")
