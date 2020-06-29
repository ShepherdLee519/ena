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
units = STEM.data[,c("classID","gpID","gpNO")]

# 确定会话
conversation = STEM.data[,c("classID","gpID","taskID")]

# 确定讨论内容的编码方案
codeCols = c("analysis","objective","context","knowledge","activity","technology","evaluation")
codes = STEM.data[,codeCols]

# 计算累计邻接向量，定义节的大小是5行
accum = ena.accumulate.data(units = units,conversation = conversation,codes = codes,window.size.back = 5)

# 计算绘制网络图的相关参数
set = ena.make.set(enadata = accum)

# 绘制各个分析单位的质心
target01.points = as.matrix(set$points[classID==1])
target02.points = as.matrix(set$points[classID==2])
target11.points = as.matrix(set$points[classID==1][gpID==1])
target12.points = as.matrix(set$points[classID==1][gpID==2])
target13.points = as.matrix(set$points[classID==1][gpID==3])
target14.points = as.matrix(set$points[classID==1][gpID==4])

# 网络图所有边的权重
target01.lineweights = as.matrix(set$line.weights[classID==1])
target02.lineweights = as.matrix(set$line.weights[classID==2])

# 计算所有分析单位在每条边的平均权重
target01.mean = as.vector(colMeans(target01.lineweights))
target02.mean = as.vector(colMeans(target02.lineweights))

# 每条边的权重差
subtracted.mean = target01.mean - target02.mean

enaplot = ena.plot(set, title = "ENA PLOT TITLE")  %>%
  ena.plot.points(points = target11.points, confidence.interval = "box", colors = c("#ffff00")) %>%
  ena.plot.group(point = target11.points, colors = c("#ffff00"), confidence.interval = "box") %>%
  ena.plot.points(points = target12.points, confidence.interval = "box", colors = c("#92d050")) %>%
  ena.plot.group(point = target12.points, colors = c("#92d050"), confidence.interval = "box") %>%
  ena.plot.points(points = target13.points, confidence.interval = "box", colors = c("#00b0f0")) %>%
  ena.plot.group(point = target13.points, colors = c("#00b0f0"), confidence.interval = "box") %>%
  ena.plot.points(points = target14.points, confidence.interval = "box", colors = c("#ff66ff")) %>%
  ena.plot.group(point = target14.points, colors = c("#ff66ff"), confidence.interval = "box") %>%
  ena.plot.network(network = subtracted.mean *8, colors = c("#4bacc6","#f79646"))
setwd("../output")
htmlwidgets::saveWidget(enaplot$plot, file="./output.html")
