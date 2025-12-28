// Mermaid 초기화
mermaid.initialize({
    startOnLoad: true,
    theme: 'dark',
    themeVariables: {
        primaryColor: '#a78bfa',
        primaryTextColor: '#0f172a',
        primaryBorderColor: '#8b5cf6',
        lineColor: '#a78bfa',
        secondaryColor: '#c4b5fd',
        tertiaryColor: '#ddd6fe',
        background: 'transparent',
        mainBkg: '#a78bfa',
        secondBkg: '#c4b5fd',
        tertiaryBkg: '#ddd6fe',
        textColor: '#0f172a',
        secondaryTextColor: '#1e293b',
        tertiaryTextColor: '#334155',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '14px',
        nodeBkg: '#a78bfa',
        nodeBorder: '#8b5cf6',
        clusterBkg: '#c4b5fd',
        clusterBorder: '#a78bfa',
        defaultLinkColor: '#a78bfa',
        titleColor: '#0f172a',
        edgeLabelBackground: '#ddd6fe',
        actorBorder: '#8b5cf6',
        actorBkg: '#a78bfa',
        actorTextColor: '#0f172a',
        actorLineColor: '#8b5cf6',
        signalColor: '#0f172a',
        signalTextColor: '#0f172a',
        labelBoxBkgColor: '#c4b5fd',
        labelBoxBorderColor: '#8b5cf6',
        labelTextColor: '#0f172a',
        loopTextColor: '#0f172a',
        noteBorderColor: '#8b5cf6',
        noteBkgColor: '#ddd6fe',
        noteTextColor: '#0f172a',
        activationBorderColor: '#8b5cf6',
        activationBkgColor: '#c4b5fd',
        sequenceNumberColor: '#0f172a',
        sectionBkgColor: '#c4b5fd',
        altSectionBkgColor: '#ddd6fe',
        sectionBkgColor2: '#a78bfa',
        excludeBkgColor: '#c4b5fd',
        taskBorderColor: '#8b5cf6',
        taskBkgColor: '#a78bfa',
        taskTextLightColor: '#0f172a',
        taskTextColor: '#0f172a',
        taskTextDarkColor: '#0f172a',
        taskTextOutsideColor: '#a78bfa',
        taskTextClickableColor: '#0f172a',
        activeTaskBorderColor: '#8b5cf6',
        activeTaskBkgColor: '#c4b5fd',
        gridColor: '#a78bfa',
        doneTaskBkgColor: '#ddd6fe',
        doneTaskBorderColor: '#8b5cf6',
        critBorderColor: '#8b5cf6',
        critBkgColor: '#c4b5fd',
        taskTextLineColor: '#0f172a',
        todayLineColor: '#a78bfa',
        labelColor: '#0f172a'
    },
    flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis',
        padding: 20
    }
});

// 패닝 기능 구현
class PanZoomController {
    constructor(container, wrapper) {
        this.container = container;
        this.wrapper = wrapper;
        this.scale = 1;
        this.panX = 0;
        this.panY = 0;
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.initialPanX = 0;
        this.initialPanY = 0;
        this.initialScale = 1;
        this.initialPanXValue = 0;
        this.initialPanYValue = 0;
        this.zoomPercentageElement = document.getElementById('zoomPercentage');
        
        this.init();
    }
    
    init() {
        // 마우스 이벤트
        this.container.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.container.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.container.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.container.addEventListener('mouseleave', this.onMouseUp.bind(this));
        
        // 휠 이벤트
        this.container.addEventListener('wheel', this.onWheel.bind(this), { passive: false });
        
        this.updateTransform();
    }
    
    onMouseDown(e) {
        if (e.button === 0) { // 좌클릭만
            this.isDragging = true;
            this.startX = e.clientX - this.panX;
            this.startY = e.clientY - this.panY;
            this.initialPanX = this.panX;
            this.initialPanY = this.panY;
            this.container.classList.add('dragging');
            e.preventDefault();
        }
    }
    
    onMouseMove(e) {
        if (this.isDragging) {
            this.panX = e.clientX - this.startX;
            this.panY = e.clientY - this.startY;
            this.updateTransform();
        }
    }
    
    onMouseUp(e) {
        if (this.isDragging) {
            this.isDragging = false;
            this.container.classList.remove('dragging');
        }
    }
    
    onWheel(e) {
        e.preventDefault();
        
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.max(0.1, Math.min(3, this.scale * delta));
        
        // 마우스 위치를 기준으로 확대/축소
        const rect = this.container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const scaleChange = newScale / this.scale;
        this.panX = mouseX - (mouseX - this.panX) * scaleChange;
        this.panY = mouseY - (mouseY - this.panY) * scaleChange;
        
        this.scale = newScale;
        this.updateTransform();
    }
    

    
    updateTransform() {
        const transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.scale})`;
        console.log('[PanZoomController.updateTransform]', {
            panX: this.panX,
            panY: this.panY,
            scale: this.scale,
            transform: transform,
            timestamp: new Date().toISOString()
        });
        this.wrapper.style.transform = transform;
        this.updateZoomPercentage();
    }
    
    updateZoomPercentage() {
        if (this.zoomPercentageElement) {
            const percentage = Math.round(this.scale * 100);
            this.zoomPercentageElement.textContent = `${percentage}%`;
        }
    }
    
    setInitialView(scale, panX, panY) {
        this.initialScale = scale;
        this.initialPanXValue = panX;
        this.initialPanYValue = panY;
    }
    
    resetToInitialView() {
        this.scale = this.initialScale;
        this.panX = this.initialPanXValue;
        this.panY = this.initialPanYValue;
        this.updateTransform();
    }
    
    reset() {
        this.scale = 1;
        this.panX = 0;
        this.panY = 0;
        this.updateTransform();
    }
}

// 검색 기능
class NodeSearch {
    constructor() {
        this.searchInput = document.getElementById('nodeSearch');
        this.searchBtn = document.getElementById('searchBtn');
        this.resultsContainer = document.getElementById('searchResults');
        this.nodes = [];
        
        this.init();
    }
    
    init() {
        // Mermaid 렌더링 완료 후 노드 정보 수집
        setTimeout(() => {
            this.collectNodes();
        }, 2000);
        
        this.searchBtn.addEventListener('click', () => this.performSearch());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });
    }
    
    collectNodes() {
        const wrapper = document.getElementById('mermaidWrapper');
        if (!wrapper) return;
        
        // 모든 SVG 요소에서 노드 이름 추출
        const svgs = wrapper.querySelectorAll('svg');
        const nodeMap = new Map();
        
        svgs.forEach(svg => {
            const textElements = svg.querySelectorAll('p');
            textElements.forEach(p => {
                const nodeName = p.textContent.trim();
                if (nodeName && !nodeMap.has(nodeName)) {
                    // 노드의 위치 정보도 함께 저장
                    const rect = p.getBoundingClientRect();
                    const parent = p.closest('g');
                    if (parent) {
                        nodeMap.set(nodeName, {
                            name: nodeName,
                            element: parent,
                            svg: svg,
                            x: rect.left,
                            y: rect.top
                        });
                    }
                }
            });
        });
        
        this.nodes = Array.from(nodeMap.values());
        console.log('[NodeSearch] 수집된 노드 수:', this.nodes.length);
    }
    
    performSearch() {
        const query = this.searchInput.value.trim().toLowerCase();
        
        if (!query) {
            this.clearResults();
            return;
        }
        
        const results = this.nodes.filter(node => 
            node.name.toLowerCase().includes(query)
        );
        
        this.displayResults(results, query);
        this.highlightNodes(results);
    }
    
    displayResults(results, query) {
        if (results.length === 0) {
            this.resultsContainer.innerHTML = `
                <div class="no-results">
                    "${query}"에 해당하는 노드를 찾을 수 없습니다.
                </div>
            `;
            return;
        }
        
        this.resultsContainer.innerHTML = results.map(node => `
            <div class="result-item" data-node="${node.name}">
                <div class="node-name">${this.highlightText(node.name, query)}</div>
            </div>
        `).join('');
        
        // 결과 항목 클릭 이벤트
        this.resultsContainer.querySelectorAll('.result-item').forEach(item => {
            item.addEventListener('click', () => {
                const nodeName = item.dataset.node;
                const node = this.nodes.find(n => n.name === nodeName);
                if (node) {
                    this.scrollToNode(node);
                }
            });
        });
    }
    
    highlightText(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark style="background: #fbbf24; color: #0f172a; padding: 2px 4px; border-radius: 4px; font-weight: 600;">$1</mark>');
    }
    
    highlightNodes(results) {
        const wrapper = document.getElementById('mermaidWrapper');
        if (!wrapper) return;
        
        // 검색된 노드가 포함된 SVG 찾기
        const matchedSvgs = new Set();
        results.forEach(result => {
            if (result.svg) {
                matchedSvgs.add(result.svg);
            }
        });
        
        const mermaidGrid = wrapper.querySelector('.mermaid-grid');
        if (!mermaidGrid) return;
        
        // 모든 플로우차트 컨테이너 찾기
        const flowchartContainers = mermaidGrid.querySelectorAll('.mermaid');
        
        flowchartContainers.forEach(container => {
            const svg = container.querySelector('svg');
            if (!svg) return;
            
            const isMatched = matchedSvgs.has(svg);
            
            if (isMatched) {
                // 검색된 노드가 있는 플로우차트는 보이게
                container.style.opacity = '1';
                container.style.transition = 'opacity 0.3s ease';
                svg.style.opacity = '1';
                svg.style.transition = 'opacity 0.3s ease';
                
                // 검색된 노드에 하이라이트 효과
                results.forEach(result => {
                    if (result.svg === svg && result.element) {
                        result.element.style.opacity = '1';
                        result.element.style.filter = 'drop-shadow(0 0 8px rgba(167, 139, 250, 0.8))';
                    }
                });
            } else {
                // 검색된 노드가 없는 플로우차트는 투명하게
                container.style.opacity = '0.2';
                container.style.transition = 'opacity 0.3s ease';
                svg.style.opacity = '0.2';
                svg.style.transition = 'opacity 0.3s ease';
            }
        });
    }
    
    scrollToNode(node) {
        // 노드로 이동 (패닝 컨트롤러를 통해)
        if (node.element && node.svg && panZoomController) {
            const svgRect = node.svg.getBoundingClientRect();
            const nodeRect = node.element.getBoundingClientRect();
            
            const containerRect = document.getElementById('canvasContainer').getBoundingClientRect();
            
            // 노드를 화면 중앙으로 이동
            const targetX = containerRect.width / 2 - (nodeRect.left - svgRect.left + nodeRect.width / 2);
            const targetY = containerRect.height / 2 - (nodeRect.top - svgRect.top + nodeRect.height / 2);
            
            panZoomController.panX = targetX;
            panZoomController.panY = targetY;
            panZoomController.updateTransform();
        }
    }
    
    clearResults() {
        this.resultsContainer.innerHTML = '';
        
        // 모든 플로우차트와 노드의 하이라이트 제거
        const wrapper = document.getElementById('mermaidWrapper');
        if (!wrapper) return;
        
        const svgs = wrapper.querySelectorAll('svg');
        const mermaidGrid = wrapper.querySelector('.mermaid-grid');
        const flowchartContainers = mermaidGrid ? mermaidGrid.querySelectorAll('.mermaid') : [];
        
        svgs.forEach(svg => {
            svg.style.opacity = '1';
            svg.querySelectorAll('g').forEach(g => {
                g.style.opacity = '1';
                g.style.filter = 'none';
            });
        });
        
        flowchartContainers.forEach(container => {
            container.style.opacity = '1';
        });
    }
}

// JSON 데이터를 Mermaid 플로우차트 문법으로 변환
function convertJsonToMermaid(nodes) {
    if (!nodes || nodes.length === 0) return '';
    
    let mermaidCode = 'flowchart TD\n';
    
    // 노드 정의 및 연결 생성
    const nodeMap = new Map();
    nodes.forEach(node => {
        nodeMap.set(node.id, node);
    });
    
    // 모든 노드 정의
    nodes.forEach(node => {
        // Mermaid에서 사용할 수 있도록 ID를 안전하게 변환 (특수문자 제거)
        const safeId = node.id.replace(/[^a-zA-Z0-9_]/g, '_');
        const nodeName = node.name.replace(/"/g, '&quot;'); // 따옴표 이스케이프
        mermaidCode += `    ${safeId}["${nodeName}"]\n`;
    });
    
    // 연결 생성
    nodes.forEach(node => {
        const fromId = node.id.replace(/[^a-zA-Z0-9_]/g, '_');
        
        // next 배열의 각 노드로 연결
        if (node.next && node.next.length > 0) {
            node.next.forEach(nextId => {
                const toId = nextId.replace(/[^a-zA-Z0-9_]/g, '_');
                mermaidCode += `    ${fromId} --> ${toId}\n`;
            });
        }
    });
    
    return mermaidCode;
}

// JSON 파일을 읽어서 플로우차트 생성
async function loadFlowchartsFromJson() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error('JSON 파일을 불러올 수 없습니다.');
        }
        
        const jsonData = await response.json();
        console.log('[JSON 로드] 플로우차트 데이터:', jsonData);
        
        // JSON 구조 확인: 배열의 배열인지 단일 배열인지
        let flowcharts = [];
        if (Array.isArray(jsonData)) {
            if (jsonData.length > 0 && Array.isArray(jsonData[0])) {
                // 배열의 배열 형태 (여러 플로우차트)
                flowcharts = jsonData;
            } else if (jsonData.length > 0 && typeof jsonData[0] === 'object' && jsonData[0].id) {
                // 단일 플로우차트 (노드 배열) - 하나의 플로우차트로 처리
                flowcharts = [jsonData];
            }
        } else {
            console.warn('[경고] JSON 데이터가 배열이 아닙니다.');
        }
        
        const mermaidGrid = document.getElementById('mermaidGrid');
        if (!mermaidGrid) {
            console.error('mermaidGrid 요소를 찾을 수 없습니다.');
            return 0;
        }
        
        // 기존 내용 제거
        mermaidGrid.innerHTML = '';
        
        // 플로우차트 개수에 따라 그리드 레이아웃 계산
        const count = flowcharts.length;
        let cols, rows;
        
        if (count === 0) {
            cols = 1;
            rows = 1;
        } else if (count === 1) {
            cols = 1;
            rows = 1;
        } else {
            // 정사각형에 가까운 형태로 계산
            cols = Math.ceil(Math.sqrt(count));
            rows = Math.ceil(count / cols);
        }
        
        // 그리드 레이아웃 동적 설정
        mermaidGrid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        mermaidGrid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        
        // 플로우차트 개수에 따라 크기와 간격 조정
        let flowchartWidth, flowchartHeight, gap, padding;
        
        if (count === 1) {
            // 단일 플로우차트: 크게 표시
            flowchartWidth = '1200px';
            flowchartHeight = '800px';
            gap = '40px';
            padding = '40px';
        } else if (count <= 4) {
            // 2-4개: 중간 크기
            flowchartWidth = '600px';
            flowchartHeight = '400px';
            gap = '60px';
            padding = '40px';
        } else if (count <= 9) {
            // 5-9개: 작은 크기
            flowchartWidth = '400px';
            flowchartHeight = '300px';
            gap = '60px';
            padding = '40px';
        } else {
            // 10개 이상: 더 작은 크기
            flowchartWidth = '300px';
            flowchartHeight = '250px';
            gap = '50px';
            padding = '30px';
        }
        
        // 그리드 간격과 패딩 설정
        mermaidGrid.style.gap = gap;
        mermaidGrid.style.padding = padding;
        
        console.log(`[그리드 레이아웃] ${count}개 플로우차트 → ${rows}행 ${cols}열 그리드`);
        console.log(`[플로우차트 크기] ${flowchartWidth} x ${flowchartHeight}, 간격: ${gap}, 패딩: ${padding}`);
        
        // 각 플로우차트 생성
        flowcharts.forEach((flowchartData, index) => {
            const mermaidCode = convertJsonToMermaid(flowchartData);
            
            const flowchartDiv = document.createElement('div');
            flowchartDiv.className = 'mermaid';
            flowchartDiv.setAttribute('data-flowchart', index + 1);
            flowchartDiv.textContent = mermaidCode;
            
            // 플로우차트 크기 설정
            flowchartDiv.style.width = flowchartWidth;
            flowchartDiv.style.height = flowchartHeight;
            flowchartDiv.style.minWidth = flowchartWidth;
            flowchartDiv.style.minHeight = flowchartHeight;
            
            mermaidGrid.appendChild(flowchartDiv);
        });
        
        console.log(`[플로우차트 생성] ${flowcharts.length}개의 플로우차트가 생성되었습니다.`);
        
        // Mermaid 렌더링 실행
        mermaid.run();
        
        return flowcharts.length;
        
    } catch (error) {
        console.error('[오류] JSON 파일 로드 실패:', error);
        return 0;
    }
}

// 초기화
let panZoomController;
let nodeSearch;

document.addEventListener('DOMContentLoaded', async () => {
    console.log('[DOMContentLoaded] 페이지 로드 완료', new Date().toISOString());
    
    // JSON 파일에서 플로우차트 로드
    const flowchartCount = await loadFlowchartsFromJson();
    
    const container = document.getElementById('canvasContainer');
    const wrapper = document.getElementById('mermaidWrapper');
    
    console.log('[초기 상태 확인]', {
        container: container ? '존재' : '없음',
        wrapper: wrapper ? '존재' : '없음',
        wrapperHasSVG: wrapper?.querySelector('svg') ? '있음' : '없음',
        expectedFlowcharts: flowchartCount
    });
    
    // Mermaid 렌더링 완료를 기다리는 함수
    function waitForMermaidRender(attempts = 0, maxAttempts = 30) {
        const svgs = wrapper?.querySelectorAll('svg');
        const containerRect = container?.getBoundingClientRect();
        const wrapperRect = wrapper?.getBoundingClientRect();
        const expectedSvgs = flowchartCount || 1; // 동적으로 계산된 플로우차트 개수
        
        console.log(`[waitForMermaidRender] 시도 ${attempts + 1}/${maxAttempts}`, {
            svgs: svgs ? `${svgs.length}/${expectedSvgs} 렌더링됨` : '대기중',
            containerRect: containerRect ? {
                width: containerRect.width,
                height: containerRect.height
            } : '없음',
            wrapperRect: wrapperRect ? {
                width: wrapperRect.width,
                height: wrapperRect.height,
                left: wrapperRect.left,
                top: wrapperRect.top
            } : '없음'
        });
        
        if (svgs && svgs.length >= expectedSvgs && containerRect && wrapperRect && wrapperRect.width > 0 && wrapperRect.height > 0) {
            console.log('[Mermaid 렌더링 완료] 초기화 시작', new Date().toISOString());
            
            // 플로우차트 개수에 따라 초기 스케일 조정
            let margin, maxScale;
            
            if (expectedSvgs === 1) {
                // 단일 플로우차트: 100%에 가깝게 표시 (약간의 여유만)
                margin = 0.05; // 5% 여유 공간
                maxScale = 1.0; // 최대 100%
            } else if (expectedSvgs <= 4) {
                // 2-4개: 적당한 여유 공간
                margin = 0.1; // 10% 여유 공간
                maxScale = 1.0;
            } else {
                // 5개 이상: 전체가 보이도록
                margin = 0.1; // 10% 여유 공간
                maxScale = 1.0;
            }
            
            // 전체 그리드가 보이도록 스케일 계산
            const scaleX = (containerRect.width * (1 - margin)) / wrapperRect.width;
            const scaleY = (containerRect.height * (1 - margin)) / wrapperRect.height;
            const initialScale = Math.min(scaleX, scaleY, maxScale);
            
            // 스케일 적용 후 중앙 정렬
            const scaledWidth = wrapperRect.width * initialScale;
            const scaledHeight = wrapperRect.height * initialScale;
            const centerX = containerRect.width / 2;
            const centerY = containerRect.height / 2;
            const scaledCenterX = scaledWidth / 2;
            const scaledCenterY = scaledHeight / 2;
            
            const calculatedPanX = centerX - scaledCenterX;
            const calculatedPanY = centerY - scaledCenterY;
            
            console.log('[위치 및 스케일 계산]', {
                containerSize: { width: containerRect.width, height: containerRect.height },
                wrapperSize: { width: wrapperRect.width, height: wrapperRect.height },
                calculatedScale: initialScale,
                scaledSize: { width: scaledWidth, height: scaledHeight },
                containerCenter: { x: centerX, y: centerY },
                scaledCenter: { x: scaledCenterX, y: scaledCenterY },
                calculatedPan: { x: calculatedPanX, y: calculatedPanY }
            });
            
            panZoomController = new PanZoomController(container, wrapper);
            panZoomController.scale = initialScale;
            panZoomController.panX = calculatedPanX;
            panZoomController.panY = calculatedPanY;
            panZoomController.setInitialView(initialScale, calculatedPanX, calculatedPanY);
            panZoomController.updateTransform();
            
            console.log('[초기화 완료]', {
                finalPanX: panZoomController.panX,
                finalPanY: panZoomController.panY,
                finalScale: panZoomController.scale,
                appliedTransform: wrapper.style.transform
            });
            
            // 초기화 버튼 이벤트 리스너
            const resetBtn = document.getElementById('zoomResetBtn');
            if (resetBtn) {
                resetBtn.addEventListener('click', () => {
                    if (panZoomController) {
                        panZoomController.resetToInitialView();
                    }
                });
            }
            
            nodeSearch = new NodeSearch();
            
            // 초기화 후 노드 수집 재시도
            setTimeout(() => {
                if (nodeSearch) {
                    nodeSearch.collectNodes();
                }
            }, 500);
        } else if (attempts < maxAttempts) {
            setTimeout(() => waitForMermaidRender(attempts + 1, maxAttempts), 100);
        } else {
            console.error('[오류] Mermaid 렌더링 대기 시간 초과');
            // 그래도 초기화 시도
            if (container && wrapper) {
                panZoomController = new PanZoomController(container, wrapper);
                nodeSearch = new NodeSearch();
            }
        }
    }
    
    // 즉시 시작 (첫 시도)
    waitForMermaidRender();
});

