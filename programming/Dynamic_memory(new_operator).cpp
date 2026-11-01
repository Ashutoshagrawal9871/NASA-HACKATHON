#include<iostream>

using namespace std;

int main(){
    
    int *ptr;
    
    ptr = new int ;
    
    cout<<"Number of byte allocated to ptr is "<<sizeof(*ptr)<<endl;
    
    *ptr = 100;
    
    cout<<"Value at ptr is "<<*ptr<<endl;
    
    return 0;

}